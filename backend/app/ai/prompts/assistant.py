"""
AI助手的Prompt模板
"""

SYSTEM_PROMPT = """你是一个智能的个人记录助手，帮助用户管理和回顾他们观看的电影、剧集、动漫和阅读的书籍。

你的能力包括：
1. 查询用户的观影/阅读历史
2. 根据用户偏好推荐内容
3. 分析用户的观看习惯和喜好
4. 生成个性化的回顾和总结

回答时请遵循以下原则：
- 友好、自然的对话风格
- 基于用户的实际记录数据回答
- 如果没有相关数据，请诚实告知
- 提供具体的标题、类型、评分等信息
- 回答要简洁明了，不要过于冗长

用户的记录信息：
{context}

请基于以上信息回答用户的问题。
"""

QUERY_HISTORY_EXAMPLES = """
用户问题示例：
1. "我去年看了哪些悬疑片？"
   - 筛选content_type=movie, tags包含"悬疑"
   - 按时间倒序排列

2. "我最近在看什么动漫？"
   - 筛选content_type=anime
   - 按updated_at倒序
   - 状态为watching

3. "我给了哪些电影5星评价？"
   - 筛选rating=10（满分10分制）
   - 列出标题和观看时间
"""

RECOMMENDATION_EXAMPLES = """
推荐请求示例：
1. "推荐几部科幻电影"
   - 基于用户已观看的科幻片
   - 考虑用户的评分偏好
   - 推荐相似主题或导演的作品

2. "我想看点轻松的喜剧"
   - 查找用户高评分的喜剧
   - 推荐类似风格的内容

3. "根据我的喜好推荐书籍"
   - 分析用户阅读历史
   - 考虑类型、作者、主题
"""

STATS_ANALYSIS_EXAMPLES = """
统计分析示例：
1. "我最喜欢的类型是什么？"
   - 统计各类型的数量和平均评分
   - 找出高频出现的标签

2. "我的观影习惯是怎样的？"
   - 分析观看频率
   - 偏好的内容类型
   - 评分分布

3. "今年我看了多少部电影？"
   - 按年份统计数量
   - 对比不同类型的占比
"""

REVIEW_GENERATION_PROMPT = """
请根据用户的记录生成一份{period}回顾。

回顾应包括：
1. 总体统计（观看/阅读数量、类型分布）
2. 最喜爱的内容（高评分作品）
3. 发现的趋势（新喜好、观看习惯变化）
4. 难忘的瞬间（印象深刻的作品和笔记）

语气要温暖、个性化，让用户感受到这段时间的记录意义。
"""

def build_conversation_prompt(
    user_query: str,
    context: str,
    conversation_history: list = None
) -> list:
    """
    构建完整的对话Prompt
    
    Args:
        user_query: 用户问题
        context: RAG检索的上下文
        conversation_history: 历史对话记录
        
    Returns:
        messages列表，符合OpenAI格式
    """
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT.format(context=context)
        }
    ]
    
    # 添加历史对话
    if conversation_history:
        for msg in conversation_history[-5:]:  # 只保留最近5轮对话
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
    
    # 添加当前问题
    messages.append({
        "role": "user",
        "content": user_query
    })
    
    return messages

def build_review_prompt(period: str, stats: dict, highlights: list) -> str:
    """
    构建回顾生成的Prompt
    
    Args:
        period: 时间周期（月度/年度）
        stats: 统计数据
        highlights: 精彩内容列表
        
    Returns:
        完整的prompt文本
    """
    stats_text = f"""
统计数据：
- 总共记录：{stats.get('total', 0)} 项
- 电影：{stats.get('movies', 0)} 部
- 剧集：{stats.get('tv', 0)} 部
- 动漫：{stats.get('anime', 0)} 部
- 书籍：{stats.get('books', 0)} 本
- 平均评分：{stats.get('avg_rating', 0):.1f}/10
"""
    
    highlights_text = "\n".join([
        f"- {h['title']} ({h['content_type']}) - 评分：{h['rating']}/10"
        for h in highlights[:10]
    ])
    
    prompt = REVIEW_GENERATION_PROMPT.format(period=period)
    prompt += f"\n\n{stats_text}\n\n精彩内容：\n{highlights_text}"
    
    return prompt


