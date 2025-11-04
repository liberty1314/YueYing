"""
标签生成 Prompt 模板
"""
from typing import Optional


class TagGenerationPrompts:
    """标签生成 Prompt 模板类"""

    SYSTEM_PROMPT = """你是一个专业的内容标签生成助手。你的任务是为电影、剧集、动漫、书籍、游戏等内容生成准确、有洞察力的标签。

标签分为三类：
1. **情绪标签**：描述内容带给观众的情感体验（例如：治愈、烧脑、感动、轻松、压抑、惊悚等）
2. **主题标签**：描述内容的核心主题（例如：成长、爱情、科幻、悬疑、家庭、友情等）
3. **风格标签**：描述内容的艺术风格或类型（例如：文艺、商业、实验、经典、现代、复古等）

请注意：
- 标签应该简洁明了（2-4个汉字）
- 标签应该准确反映内容特点
- 避免重复或相似的标签
- 优先使用中文标签
- 每类标签生成1-2个即可"""

    @staticmethod
    def build_content_tags_prompt(
        content_type: str,
        title: str,
        description: Optional[str] = None,
        user_notes: Optional[str] = None,
        genres: Optional[list] = None,
    ) -> str:
        """
        构建基于内容信息的标签生成 Prompt

        Args:
            content_type: 内容类型（movie/tv/anime/book/game）
            title: 标题
            description: 内容简介
            user_notes: 用户笔记
            genres: 类型标签

        Returns:
            完整的 Prompt
        """
        content_type_map = {
            "movie": "电影",
            "tv": "电视剧",
            "anime": "动漫",
            "book": "书籍",
            "game": "游戏",
        }

        prompt = f"""请为以下{content_type_map.get(content_type, '内容')}生成3-5个标签。

**内容信息：**
标题：{title}
"""

        if description:
            prompt += f"简介：{description}\n"

        if genres:
            prompt += f"类型：{', '.join(genres)}\n"

        if user_notes:
            prompt += f"\n**用户笔记：**\n{user_notes}\n"

        prompt += """
**要求：**
1. 从情绪、主题、风格三个维度各生成1-2个标签
2. 标签应该简洁（2-4个汉字）
3. 标签之间用逗号分隔
4. 只返回标签，不需要解释

**示例输出格式：**
治愈,成长,文艺,温暖

请生成标签："""

        return prompt

    @staticmethod
    def build_note_tags_prompt(
        title: str,
        notes: str,
    ) -> str:
        """
        构建基于用户笔记的标签生成 Prompt

        Args:
            title: 内容标题
            notes: 用户笔记

        Returns:
            完整的 Prompt
        """
        prompt = f"""请根据用户对《{title}》的观看笔记，生成3-5个标签。

**用户笔记：**
{notes}

**要求：**
1. 从用户的情感体验、提到的主题、表达的风格偏好中提取标签
2. 标签应该简洁（2-4个汉字）
3. 标签之间用逗号分隔
4. 只返回标签，不需要解释

**示例输出格式：**
感动,温暖,治愈

请生成标签："""

        return prompt

    @staticmethod
    def build_batch_tags_prompt(items: list) -> str:
        """
        构建批量标签生成 Prompt

        Args:
            items: 内容列表，每个包含 title 和 description

        Returns:
            完整的 Prompt
        """
        prompt = """请为以下内容批量生成标签。每个内容生成3-5个标签。

"""

        for idx, item in enumerate(items, 1):
            prompt += f"{idx}. 《{item['title']}》\n"
            if item.get('description'):
                prompt += f"   简介：{item['description'][:100]}...\n"
            prompt += "\n"

        prompt += """**要求：**
1. 每个内容从情绪、主题、风格三个维度生成标签
2. 标签应该简洁（2-4个汉字）
3. 按照 "序号. 标签1,标签2,标签3" 的格式输出
4. 只返回标签，不需要解释

**示例输出格式：**
1. 治愈,成长,文艺
2. 悬疑,烧脑,惊悚
3. 浪漫,温暖,感动

请生成标签："""

        return prompt

    @staticmethod
    def build_refine_tags_prompt(
        title: str,
        current_tags: list,
        feedback: str,
    ) -> str:
        """
        构建标签优化 Prompt

        Args:
            title: 内容标题
            current_tags: 当前标签列表
            feedback: 用户反馈

        Returns:
            完整的 Prompt
        """
        prompt = f"""请根据用户反馈，优化《{title}》的标签。

**当前标签：**
{', '.join(current_tags)}

**用户反馈：**
{feedback}

**要求：**
1. 保留准确的标签，替换不准确的标签
2. 根据用户反馈调整标签
3. 确保标签简洁（2-4个汉字）
4. 标签之间用逗号分隔
5. 只返回优化后的标签，不需要解释

请生成优化后的标签："""

        return prompt

