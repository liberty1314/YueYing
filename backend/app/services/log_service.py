"""
日志解析服务
提供日志文件读取、解析和筛选功能
"""
import os
import re
from datetime import datetime
from typing import List, Optional, Tuple
from pathlib import Path
from loguru import logger

from app.schemas.log import LogEntry, LogFilter


class LogService:
    """日志服务类"""
    
    # loguru 日志格式的正则表达式
    # 格式: 2025-11-08 12:30:45.123 | INFO     | app.main:startup:45 | Application started
    LOG_PATTERN = re.compile(
        r'^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3})\s*\|\s*'
        r'(\w+)\s*\|\s*'
        r'([^\|]+)\s*\|\s*'
        r'(.*)$'
    )
    
    def __init__(self, log_file_path: str = "logs/app.log"):
        """
        初始化日志服务
        
        Args:
            log_file_path: 日志文件路径
        """
        self.log_file_path = Path(log_file_path)
        
    def _parse_log_line(self, line: str) -> Optional[LogEntry]:
        """
        解析单行日志
        
        Args:
            line: 日志行文本
            
        Returns:
            LogEntry 或 None（解析失败时）
        """
        match = self.LOG_PATTERN.match(line.strip())
        if not match:
            return None
            
        timestamp_str, level, location, message = match.groups()
        
        try:
            # 解析时间戳
            timestamp = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S.%f")
            
            return LogEntry(
                timestamp=timestamp,
                level=level.strip(),
                location=location.strip(),
                message=message.strip(),
                raw_line=line.strip(),
                is_multiline=False
            )
        except Exception as e:
            logger.warning(f"Failed to parse log line: {e}")
            return None
    
    def _read_file_reverse(self, limit: int = 100) -> List[str]:
        """
        反向读取文件（从末尾开始）
        
        Args:
            limit: 读取的行数限制
            
        Returns:
            日志行列表（从新到旧）
        """
        if not self.log_file_path.exists():
            return []
        
        lines = []
        try:
            with open(self.log_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                # 移动到文件末尾
                f.seek(0, os.SEEK_END)
                file_size = f.tell()
                
                if file_size == 0:
                    return []
                
                # 缓冲区大小
                buffer_size = 8192
                position = file_size
                buffer = ""
                
                while position > 0 and len(lines) < limit:
                    # 计算读取位置
                    read_size = min(buffer_size, position)
                    position -= read_size
                    f.seek(position)
                    
                    # 读取并添加到缓冲区
                    chunk = f.read(read_size)
                    buffer = chunk + buffer
                    
                    # 按行分割
                    split_lines = buffer.split('\n')
                    
                    # 保留第一个不完整的行作为新的缓冲区
                    if position > 0:
                        buffer = split_lines[0]
                        split_lines = split_lines[1:]
                    else:
                        buffer = ""
                    
                    # 添加完整的行（反向）
                    for line in reversed(split_lines):
                        if line.strip():
                            lines.append(line)
                            if len(lines) >= limit:
                                break
                
        except Exception as e:
            logger.error(f"Error reading log file: {e}")
            
        return lines
    
    def tail_logs(self, n: int = 100) -> List[LogEntry]:
        """
        读取最新的 n 条日志
        
        Args:
            n: 读取的日志条数
            
        Returns:
            日志列表（从旧到新）
        """
        lines = self._read_file_reverse(limit=n * 2)  # 多读一些以防有多行日志
        
        logs = []
        current_log = None
        
        # 从新到旧处理，但构建完整的日志条目
        for line in reversed(lines):
            entry = self._parse_log_line(line)
            
            if entry:
                # 这是一个新的日志条目
                if current_log:
                    logs.append(current_log)
                current_log = entry
            else:
                # 可能是多行日志的一部分
                if current_log and line.strip():
                    current_log.message += "\n" + line.strip()
                    current_log.raw_line += "\n" + line.strip()
                    current_log.is_multiline = True
        
        # 添加最后一条日志
        if current_log:
            logs.append(current_log)
        
        # 返回最新的 n 条
        return logs[-n:]
    
    def read_logs(
        self,
        page: int = 1,
        page_size: int = 50,
        filters: Optional[LogFilter] = None
    ) -> Tuple[List[LogEntry], int]:
        """
        读取日志并分页
        
        Args:
            page: 页码（从 1 开始）
            page_size: 每页大小
            filters: 过滤条件
            
        Returns:
            (日志列表, 总数)
        """
        # 读取更多的日志以便筛选
        all_lines = self._read_file_reverse(limit=10000)
        
        logs = []
        current_log = None
        
        # 解析所有日志
        for line in reversed(all_lines):
            entry = self._parse_log_line(line)
            
            if entry:
                if current_log:
                    logs.append(current_log)
                current_log = entry
            else:
                if current_log and line.strip():
                    current_log.message += "\n" + line.strip()
                    current_log.raw_line += "\n" + line.strip()
                    current_log.is_multiline = True
        
        if current_log:
            logs.append(current_log)
        
        # 应用过滤器
        if filters:
            logs = self._filter_logs(logs, filters)
        
        # 分页
        total = len(logs)
        start = (page - 1) * page_size
        end = start + page_size
        
        return logs[start:end], total
    
    def _filter_logs(self, logs: List[LogEntry], filters: LogFilter) -> List[LogEntry]:
        """
        根据条件筛选日志
        
        Args:
            logs: 日志列表
            filters: 过滤条件
            
        Returns:
            筛选后的日志列表
        """
        filtered = logs
        
        # 按级别筛选
        if filters.level:
            filtered = [log for log in filtered if log.level == filters.level]
        
        # 按时间范围筛选
        if filters.start_time:
            filtered = [log for log in filtered if log.timestamp >= filters.start_time]
        
        if filters.end_time:
            filtered = [log for log in filtered if log.timestamp <= filters.end_time]
        
        # 按关键词筛选
        if filters.keyword:
            keyword_lower = filters.keyword.lower()
            filtered = [
                log for log in filtered
                if keyword_lower in log.message.lower() or
                   keyword_lower in log.location.lower()
            ]
        
        return filtered
    
    def get_log_stats(self) -> dict:
        """
        获取日志统计信息
        
        Returns:
            统计信息字典
        """
        if not self.log_file_path.exists():
            return {
                "total": 0,
                "by_level": {},
                "file_size": 0,
                "last_update": None
            }
        
        # 获取文件信息
        file_stat = self.log_file_path.stat()
        file_size = file_stat.st_size
        last_update = datetime.fromtimestamp(file_stat.st_mtime)
        
        # 读取最近的日志进行统计
        logs = self.tail_logs(n=1000)
        
        # 按级别统计
        by_level = {}
        for log in logs:
            level = log.level
            by_level[level] = by_level.get(level, 0) + 1
        
        return {
            "total": len(logs),
            "by_level": by_level,
            "file_size": file_size,
            "last_update": last_update
        }
    
    def get_available_levels(self) -> List[str]:
        """
        获取所有可用的日志级别
        
        Returns:
            日志级别列表
        """
        return ["TRACE", "DEBUG", "INFO", "SUCCESS", "WARNING", "ERROR", "CRITICAL"]


# 创建全局日志服务实例
log_service = LogService()









