"""
总结生成的 Prompt 模板
"""
from typing import Dict, Any, List
from datetime import datetime


SUMMARY_SYSTEM_PROMPT = """你是一个专业的数据分析和内容总结助手。你的任务是基于用户的观影/阅读记录，生成一份个性化、富有洞察力的总结报告。

总结要求：
1. 语言风格：轻松、友好、富有情感，像朋友聊天一样自然
2. 结构清晰：使用 Markdown 格式，包含标题、列表、重点标记
3. 数据驱动：结合具体的数字和事实，但不要堆砌数据
4. 洞察深入：不仅陈述事实，还要分析趋势、偏好和变化
5. 个性化：根据用户的独特品味和习惯提供定制化的见解
6. 长度适中：800-1200字左右，分段清晰

总结应包含以下几个部分：
- **时光回顾**：整体概览这段时间的记录情况
- **品味画像**：分析用户的类型偏好、评分习惯
- **精彩瞬间**：列举高分作品和难忘时刻
- **成长足迹**：发现趋势变化和新的兴趣点
- **展望未来**：基于历史数据提供建议和展望"""


def build_summary_prompt(
    period_type: str,
    start_date: datetime,
    end_date: datetime,
    statistics: Dict[str, Any]
) -> str:
    """
    构建总结生成的用户提示
    
    Args:
        period_type: 时期类型 (week/month/year/custom)
        start_date: 开始日期
        end_date: 结束日期
        statistics: 统计数据
    
    Returns:
        完整的用户提示
    """
    # 时间范围描述
    period_desc = {
        "week": "这一周",
        "month": "这个月",
        "year": "这一年",
        "custom": "这段时间"
    }.get(period_type, "这段时间")
    
    # 格式化日期
    start_str = start_date.strftime("%Y年%m月%d日")
    end_str = end_date.strftime("%Y年%m月%d日")
    
    # 提取关键统计数据
    total_items = statistics.get("total_items", 0)
    avg_rating = statistics.get("avg_rating", 0)
    top_tags = statistics.get("top_tags", [])[:5]
    type_dist = statistics.get("type_distribution", {})
    status_dist = statistics.get("status_distribution", {})
    high_rated = statistics.get("high_rated_items", [])[:5]
    recent_items = statistics.get("recent_items", [])[:10]
    
    prompt = f"""请为用户生成{period_desc}（{start_str} 至 {end_str}）的个性化总结报告。

## 统计数据

### 基本概况
- 记录总数：{total_items} 条
- 平均评分：{avg_rating:.1f} 分
- 记录状态：{status_dist}

### 类型分布
{_format_distribution(type_dist)}

### 热门标签
{_format_tags(top_tags)}

### 高分作品
{_format_items(high_rated)}

### 最近记录
{_format_items(recent_items[:5])}

---

请根据以上数据，生成一份温暖、富有洞察力的总结报告。使用 Markdown 格式，让用户感受到你对数据的深度理解和对他们品味的认可。"""
    
    return prompt


def _format_distribution(dist: Dict[str, int]) -> str:
    """格式化分布数据"""
    if not dist:
        return "暂无数据"
    lines = [f"- {k}: {v} 条" for k, v in dist.items()]
    return "\n".join(lines)


def _format_tags(tags: List[Dict[str, Any]]) -> str:
    """格式化标签列表"""
    if not tags:
        return "暂无标签"
    lines = [f"- {tag.get('name', '未知')}: {tag.get('count', 0)} 次" for tag in tags]
    return "\n".join(lines)


def _format_items(items: List[Dict[str, Any]]) -> str:
    """格式化作品列表"""
    if not items:
        return "暂无记录"
    lines = []
    for item in items:
        title = item.get("title", "未知作品")
        rating = item.get("rating")
        rating_str = f"（{rating} 分）" if rating else ""
        lines.append(f"- {title}{rating_str}")
    return "\n".join(lines)


KEYWORD_EXTRACTION_PROMPT = """请从以下文本中提取关键词，并统计它们的重要程度。

提取规则：
1. 优先提取类型、流派、主题相关的词汇
2. 标签的权重最高，标题次之，笔记最低
3. 过滤掉常见的停用词（如"的"、"了"、"在"等）
4. 返回 10-20 个最重要的关键词
5. 每个关键词包含词语和权重（1-100）

返回格式（JSON）：
[
  {"word": "科幻", "weight": 95},
  {"word": "悬疑", "weight": 88},
  ...
]

文本内容：
{text}
"""


def build_keyword_extraction_prompt(
    titles: List[str],
    tags: List[str],
    notes: List[str]
) -> str:
    """
    构建关键词提取提示
    
    Args:
        titles: 标题列表
        tags: 标签列表
        notes: 笔记列表
    
    Returns:
        关键词提取提示
    """
    text_parts = []
    
    if tags:
        text_parts.append(f"【标签】（权重高）\n" + "、".join(tags))
    
    if titles:
        text_parts.append(f"\n【标题】（权重中）\n" + "、".join(titles[:20]))
    
    if notes:
        # 只取有内容的笔记
        valid_notes = [n for n in notes if n and len(n) > 10]
        if valid_notes:
            text_parts.append(f"\n【笔记摘要】（权重低）\n" + "\n".join(valid_notes[:10]))
    
    text = "\n".join(text_parts)
    return KEYWORD_EXTRACTION_PROMPT.format(text=text)

