#!/bin/bash
#
# 运行所有缓存相关测试
#
# 用法:
#   ./scripts/run_all_cache_tests.sh [选项]
#
# 选项:
#   --unit          只运行单元测试
#   --integration   只运行集成测试
#   --performance   只运行性能测试
#   --coverage      生成覆盖率报告
#   --verbose       详细输出
#

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认选项
RUN_UNIT=true
RUN_INTEGRATION=true
RUN_PERFORMANCE=false
GENERATE_COVERAGE=false
VERBOSE=""

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --unit)
            RUN_UNIT=true
            RUN_INTEGRATION=false
            RUN_PERFORMANCE=false
            shift
            ;;
        --integration)
            RUN_UNIT=false
            RUN_INTEGRATION=true
            RUN_PERFORMANCE=false
            shift
            ;;
        --performance)
            RUN_UNIT=false
            RUN_INTEGRATION=false
            RUN_PERFORMANCE=true
            shift
            ;;
        --coverage)
            GENERATE_COVERAGE=true
            shift
            ;;
        --verbose|-v)
            VERBOSE="-v"
            shift
            ;;
        --help|-h)
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  --unit          只运行单元测试"
            echo "  --integration   只运行集成测试"
            echo "  --performance   只运行性能测试"
            echo "  --coverage      生成覆盖率报告"
            echo "  --verbose, -v   详细输出"
            echo "  --help, -h      显示此帮助信息"
            exit 0
            ;;
        *)
            echo -e "${RED}未知选项: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}运行缓存系统测试${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 切换到项目根目录
cd "$(dirname "$0")/.."

# 检查依赖
if ! command -v pytest &> /dev/null; then
    echo -e "${RED}错误: pytest 未安装${NC}"
    echo "请运行: pip install pytest pytest-asyncio pytest-cov"
    exit 1
fi

# 设置 Python 路径
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# 测试选项
PYTEST_OPTS="--tb=short"
if [ "$VERBOSE" = "-v" ]; then
    PYTEST_OPTS="$PYTEST_OPTS -v"
fi

if [ "$GENERATE_COVERAGE" = true ]; then
    PYTEST_OPTS="$PYTEST_OPTS --cov=app.core --cov=app.services --cov-report=html --cov-report=term"
fi

# 单元测试
if [ "$RUN_UNIT" = true ]; then
    echo -e "${GREEN}运行单元测试...${NC}"
    echo ""
    
    echo -e "${YELLOW}1. 缓存统计测试${NC}"
    pytest tests/test_cache_stats.py $PYTEST_OPTS || exit 1
    echo ""
    
    echo -e "${YELLOW}2. 内存缓存测试${NC}"
    pytest tests/test_memory_cache.py $PYTEST_OPTS || exit 1
    echo ""
    
    echo -e "${YELLOW}3. 多级缓存测试${NC}"
    pytest tests/test_multi_level_cache.py $PYTEST_OPTS || exit 1
    echo ""
    
    echo -e "${YELLOW}4. 缓存键生成器测试${NC}"
    pytest tests/test_cache_key_generator.py $PYTEST_OPTS || exit 1
    echo ""
    
    echo -e "${YELLOW}5. 缓存配置测试${NC}"
    pytest tests/test_cache_config.py $PYTEST_OPTS || exit 1
    echo ""
    
    echo -e "${YELLOW}6. 缓存预热测试${NC}"
    pytest tests/test_cache_warming.py $PYTEST_OPTS || exit 1
    echo ""
fi

# 集成测试
if [ "$RUN_INTEGRATION" = true ]; then
    echo -e "${GREEN}运行集成测试...${NC}"
    echo ""
    
    echo -e "${YELLOW}1. 缓存集成测试${NC}"
    pytest tests/test_cache_integration.py $PYTEST_OPTS || exit 1
    echo ""
    
    echo -e "${YELLOW}2. 端到端缓存测试${NC}"
    pytest tests/test_cache_end_to_end.py $PYTEST_OPTS || exit 1
    echo ""
fi

# 性能测试
if [ "$RUN_PERFORMANCE" = true ]; then
    echo -e "${GREEN}运行性能测试...${NC}"
    echo -e "${YELLOW}注意: 性能测试可能需要较长时间${NC}"
    echo ""
    
    pytest tests/test_cache_performance.py $PYTEST_OPTS -s || exit 1
    echo ""
fi

# 显示覆盖率报告
if [ "$GENERATE_COVERAGE" = true ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}覆盖率报告已生成${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "HTML 报告: htmlcov/index.html"
    echo ""
    
    # 尝试打开浏览器
    if command -v open &> /dev/null; then
        echo "正在打开浏览器..."
        open htmlcov/index.html
    elif command -v xdg-open &> /dev/null; then
        echo "正在打开浏览器..."
        xdg-open htmlcov/index.html
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}所有测试完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 显示测试统计
echo "测试统计:"
if [ "$RUN_UNIT" = true ]; then
    echo "  ✓ 单元测试: 已运行"
fi
if [ "$RUN_INTEGRATION" = true ]; then
    echo "  ✓ 集成测试: 已运行"
fi
if [ "$RUN_PERFORMANCE" = true ]; then
    echo "  ✓ 性能测试: 已运行"
fi
if [ "$GENERATE_COVERAGE" = true ]; then
    echo "  ✓ 覆盖率报告: 已生成"
fi
echo ""
