"""
定时任务调度器
使用 APScheduler 管理定时任务
"""
import asyncio
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import settings
from app.core.logging import logger
from app.services.home_cache import home_cache_service


class TaskScheduler:
    """定时任务调度器"""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self._is_running = False
    
    def _parse_refresh_time(self, time_str: str) -> tuple:
        """
        解析刷新时间配置
        
        Args:
            time_str: 时间字符串，格式 "HH:MM"
        
        Returns:
            (hour, minute) 元组
        """
        try:
            hour, minute = map(int, time_str.split(":"))
            return hour, minute
        except (ValueError, AttributeError):
            logger.warning(f"Invalid refresh time format: {time_str}, using default 01:00")
            return 1, 0
    
    async def refresh_home_data_task(self):
        """刷新首页数据的定时任务"""
        try:
            logger.info("Scheduled home data refresh started")
            await home_cache_service.refresh_all_home_data(
                expire=settings.HOME_DATA_CACHE_EXPIRE
            )
            logger.info("Scheduled home data refresh completed")
        except Exception as e:
            logger.error(f"Scheduled home data refresh failed: {e}", exc_info=True)
    
    def start(self):
        """启动调度器"""
        if self._is_running:
            logger.warning("Scheduler is already running")
            return
        
        try:
            # 解析刷新时间配置
            hour, minute = self._parse_refresh_time(settings.HOME_DATA_REFRESH_TIME)
            
            # 添加首页数据刷新任务（每天定时执行）
            self.scheduler.add_job(
                self.refresh_home_data_task,
                trigger=CronTrigger(hour=hour, minute=minute),
                id="refresh_home_data",
                name="刷新首页数据",
                replace_existing=True,
                max_instances=1,  # 同时只运行一个实例
            )
            
            logger.info(
                f"Added scheduled task: refresh_home_data "
                f"(will run daily at {hour:02d}:{minute:02d})"
            )
            
            # 启动调度器
            self.scheduler.start()
            self._is_running = True
            logger.info("Task scheduler started successfully")
            
        except Exception as e:
            logger.error(f"Failed to start scheduler: {e}", exc_info=True)
            raise
    
    def shutdown(self, wait: bool = True):
        """
        关闭调度器
        
        Args:
            wait: 是否等待所有任务完成
        """
        if not self._is_running:
            logger.warning("Scheduler is not running")
            return
        
        try:
            self.scheduler.shutdown(wait=wait)
            self._is_running = False
            logger.info("Task scheduler shutdown successfully")
        except Exception as e:
            logger.error(f"Failed to shutdown scheduler: {e}", exc_info=True)
    
    def get_jobs(self):
        """获取所有任务"""
        return self.scheduler.get_jobs()
    
    def get_job(self, job_id: str):
        """获取指定任务"""
        return self.scheduler.get_job(job_id)
    
    def pause_job(self, job_id: str):
        """暂停任务"""
        self.scheduler.pause_job(job_id)
        logger.info(f"Job paused: {job_id}")
    
    def resume_job(self, job_id: str):
        """恢复任务"""
        self.scheduler.resume_job(job_id)
        logger.info(f"Job resumed: {job_id}")
    
    def remove_job(self, job_id: str):
        """删除任务"""
        self.scheduler.remove_job(job_id)
        logger.info(f"Job removed: {job_id}")
    
    async def run_job_now(self, job_id: str):
        """立即执行任务"""
        job = self.scheduler.get_job(job_id)
        if job:
            logger.info(f"Manually triggering job: {job_id}")
            await job.func()
        else:
            logger.warning(f"Job not found: {job_id}")


# 全局调度器实例
task_scheduler = TaskScheduler()
