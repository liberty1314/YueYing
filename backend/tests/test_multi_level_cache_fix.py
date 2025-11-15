# 修复异步测试的前缀
import re

with open('/app/tests/test_multi_level_cache.py', 'r') as f:
    content = f.read()

# 替换异步测试中的 prefix="test" 为 prefix="async_test"
content = re.sub(
    r'(@async_multi_level_cached\(prefix="test")',
    r'@async_multi_level_cached(prefix="async_test"',
    content
)

with open('/app/tests/test_multi_level_cache.py', 'w') as f:
    f.write(content)

print('Fixed!')
