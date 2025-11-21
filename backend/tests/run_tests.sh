#!/bin/bash

# 测试运行脚本
# 用于运行各种类型的测试

set -e  # 遇到错误立即退出

echo "========================================="
echo "月影系统 - 测试运行器"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 函数：打印带颜色的消息
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "ℹ $1"
}

# 检查依赖
check_dependencies() {
    print_info "检查依赖..."
    
    # 检查pytest
    if ! command -v pytest &> /dev/null; then
        print_error "pytest 未安装，请运行: pip install pytest pytest-asyncio pytest-cov"
        exit 1
    fi
    
    print_success "依赖检查通过"
}

# 单元测试
run_unit_tests() {
    print_info "运行单元测试..."
    pytest tests/unit -v --cov=app --cov-report=term-missing --cov-report=html
    
    if [ $? -eq 0 ]; then
        print_success "单元测试通过"
    else
        print_error "单元测试失败"
        exit 1
    fi
}

# E2E测试
run_e2e_tests() {
    print_info "运行端到端测试..."
    pytest tests/e2e -v --tb=short
    
    if [ $? -eq 0 ]; then
        print_success "E2E测试通过"
    else
        print_warning "E2E测试部分失败（可能需要运行中的服务）"
    fi
}

# 负载测试 - k6
run_load_test_k6() {
    print_info "运行负载测试（k6）..."
    
    # 检查k6是否安装
    if ! command -v k6 &> /dev/null; then
        print_warning "k6 未安装，跳过负载测试"
        print_info "安装k6: brew install k6 (MacOS)"
        return
    fi
    
    # 检查服务是否运行
    if ! curl -s http://localhost:8000/api/health > /dev/null; then
        print_warning "后端服务未运行，跳过负载测试"
        print_info "请先启动后端服务: uvicorn app.main:app"
        return
    fi
    
    cd tests/load
    k6 run --vus 10 --duration 30s load-test.js
    cd ../..
    
    if [ $? -eq 0 ]; then
        print_success "负载测试完成"
    else
        print_error "负载测试失败"
    fi
}

# 负载测试 - Locust
run_load_test_locust() {
    print_info "运行负载测试（Locust）..."
    
    # 检查locust是否安装
    if ! command -v locust &> /dev/null; then
        print_warning "Locust 未安装，跳过负载测试"
        print_info "安装Locust: pip install locust"
        return
    fi
    
    # 检查服务是否运行
    if ! curl -s http://localhost:8000/api/health > /dev/null; then
        print_warning "后端服务未运行，跳过负载测试"
        return
    fi
    
    cd tests/load
    locust -f locustfile.py --headless --users 10 --spawn-rate 2 --run-time 60s --host http://localhost:8000
    cd ../..
    
    if [ $? -eq 0 ]; then
        print_success "负载测试完成"
    else
        print_error "负载测试失败"
    fi
}

# 代码质量检查
run_code_quality() {
    print_info "运行代码质量检查..."
    
    # Flake8
    if command -v flake8 &> /dev/null; then
        print_info "运行 flake8..."
        flake8 app --max-line-length=120 --exclude=__pycache__,migrations
    else
        print_warning "flake8 未安装，跳过代码风格检查"
    fi
    
    # Black
    if command -v black &> /dev/null; then
        print_info "运行 black（代码格式化检查）..."
        black --check app tests
    else
        print_warning "black 未安装，跳过代码格式检查"
    fi
    
    print_success "代码质量检查完成"
}

# 显示测试报告
show_coverage_report() {
    if [ -f "htmlcov/index.html" ]; then
        print_info "测试覆盖率报告已生成: htmlcov/index.html"
        
        # 在MacOS上自动打开
        if [[ "$OSTYPE" == "darwin"* ]]; then
            read -p "是否打开覆盖率报告？(y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                open htmlcov/index.html
            fi
        fi
    fi
}

# 主菜单
show_menu() {
    echo ""
    echo "请选择测试类型："
    echo "1) 运行所有测试"
    echo "2) 仅运行单元测试"
    echo "3) 仅运行E2E测试"
    echo "4) 仅运行负载测试（k6）"
    echo "5) 仅运行负载测试（Locust）"
    echo "6) 代码质量检查"
    echo "7) 快速测试（单元测试 + 代码质量）"
    echo "0) 退出"
    echo ""
    read -p "请输入选项 [0-7]: " choice
    
    case $choice in
        1)
            check_dependencies
            run_unit_tests
            run_e2e_tests
            run_load_test_k6
            show_coverage_report
            ;;
        2)
            check_dependencies
            run_unit_tests
            show_coverage_report
            ;;
        3)
            check_dependencies
            run_e2e_tests
            ;;
        4)
            run_load_test_k6
            ;;
        5)
            run_load_test_locust
            ;;
        6)
            run_code_quality
            ;;
        7)
            check_dependencies
            run_unit_tests
            run_code_quality
            show_coverage_report
            ;;
        0)
            print_info "退出测试"
            exit 0
            ;;
        *)
            print_error "无效选项"
            show_menu
            ;;
    esac
}

# 主程序
main() {
    # 切换到项目根目录
    cd "$(dirname "$0")/.."
    
    # 如果有参数，直接运行对应测试
    if [ $# -gt 0 ]; then
        case $1 in
            "unit")
                check_dependencies
                run_unit_tests
                ;;
            "e2e")
                check_dependencies
                run_e2e_tests
                ;;
            "load")
                run_load_test_k6
                ;;
            "locust")
                run_load_test_locust
                ;;
            "quality")
                run_code_quality
                ;;
            "all")
                check_dependencies
                run_unit_tests
                run_e2e_tests
                run_load_test_k6
                show_coverage_report
                ;;
            *)
                echo "用法: $0 [unit|e2e|load|locust|quality|all]"
                exit 1
                ;;
        esac
    else
        # 无参数时显示菜单
        show_menu
    fi
    
    echo ""
    print_success "测试完成！"
}

# 执行主程序
main "$@"
