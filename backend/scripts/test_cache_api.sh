#!/bin/bash
# 缓存管理 API 测试脚本
#
# 使用方法:
#   1. 先登录获取 token: ./test_cache_api.sh login
#   2. 设置 token: export TOKEN="your_token_here"
#   3. 测试各个端点: ./test_cache_api.sh <command>

BASE_URL="${API_URL:-http://localhost:8000}"
TOKEN="${TOKEN:-}"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 检查 token
check_token() {
    if [ -z "$TOKEN" ]; then
        print_error "未设置 TOKEN 环境变量"
        echo "请先运行: export TOKEN=\"your_token_here\""
        echo "或使用: ./test_cache_api.sh login 获取 token"
        exit 1
    fi
}

# 登录获取 token
login() {
    print_info "登录获取 token..."
    
    read -p "用户名 (默认: admin): " username
    username=${username:-admin}
    
    read -sp "密码: " password
    echo
    
    response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"password\":\"$password\"}")
    
    token=$(echo $response | jq -r '.access_token')
    
    if [ "$token" != "null" ] && [ -n "$token" ]; then
        print_success "登录成功！"
        echo
        echo "请运行以下命令设置 token:"
        echo "export TOKEN=\"$token\""
        echo
    else
        print_error "登录失败"
        echo $response | jq .
        exit 1
    fi
}

# 获取缓存统计
get_stats() {
    check_token
    print_info "获取缓存统计..."
    
    time_window=${1:-3600}
    
    curl -s -X GET "$BASE_URL/api/admin/cache/stats?time_window=$time_window" \
        -H "Authorization: Bearer $TOKEN" | jq .
}

# 获取热门键
get_top_keys() {
    check_token
    print_info "获取热门键..."
    
    limit=${1:-10}
    
    curl -s -X GET "$BASE_URL/api/admin/cache/stats/top-keys?limit=$limit" \
        -H "Authorization: Bearer $TOKEN" | jq .
}

# 获取缓存配置
get_config() {
    check_token
    print_info "获取缓存配置..."
    
    curl -s -X GET "$BASE_URL/api/admin/cache/config" \
        -H "Authorization: Bearer $TOKEN" | jq .
}

# 更新缓存配置
update_config() {
    check_token
    print_info "更新缓存配置..."
    
    curl -s -X PUT "$BASE_URL/api/admin/cache/config" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"l1_max_size": 2000}' | jq .
}

# 获取缓存信息
get_info() {
    check_token
    print_info "获取缓存系统信息..."
    
    curl -s -X GET "$BASE_URL/api/admin/cache/info" \
        -H "Authorization: Bearer $TOKEN" | jq .
}

# 清理缓存（按模式）
clear_pattern() {
    check_token
    pattern=${1:-"user:*"}
    
    print_info "清理匹配 '$pattern' 的缓存..."
    
    curl -s -X DELETE "$BASE_URL/api/admin/cache/clear" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"pattern\":\"$pattern\",\"clear_l1\":true,\"clear_l2\":true}" | jq .
}

# 清理所有缓存
clear_all() {
    check_token
    print_info "清理所有缓存..."
    
    read -p "确认清理所有缓存? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        print_info "已取消"
        exit 0
    fi
    
    curl -s -X DELETE "$BASE_URL/api/admin/cache/clear" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"clear_l1":true,"clear_l2":true}' | jq .
}

# 获取预热状态
get_warming_status() {
    check_token
    print_info "获取缓存预热状态..."
    
    curl -s -X GET "$BASE_URL/api/admin/cache-warming/status" \
        -H "Authorization: Bearer $TOKEN" | jq .
}

# 触发预热
trigger_warming() {
    check_token
    print_info "触发缓存预热..."
    
    curl -s -X POST "$BASE_URL/api/admin/cache-warming/warm" \
        -H "Authorization: Bearer $TOKEN" | jq .
}

# 显示帮助
show_help() {
    echo "缓存管理 API 测试脚本"
    echo
    echo "使用方法:"
    echo "  $0 <command> [args]"
    echo
    echo "命令:"
    echo "  login                    - 登录获取 token"
    echo "  stats [time_window]      - 获取缓存统计 (默认: 3600秒)"
    echo "  top-keys [limit]         - 获取热门键 (默认: 10个)"
    echo "  config                   - 获取缓存配置"
    echo "  update-config            - 更新缓存配置"
    echo "  info                     - 获取缓存系统信息"
    echo "  clear-pattern [pattern]  - 清理匹配模式的缓存 (默认: user:*)"
    echo "  clear-all                - 清理所有缓存"
    echo "  warming-status           - 获取预热状态"
    echo "  trigger-warming          - 触发预热"
    echo "  help                     - 显示此帮助"
    echo
    echo "环境变量:"
    echo "  API_URL  - API 基础 URL (默认: http://localhost:8000)"
    echo "  TOKEN    - 认证 token"
    echo
    echo "示例:"
    echo "  # 1. 登录"
    echo "  $0 login"
    echo
    echo "  # 2. 设置 token"
    echo "  export TOKEN=\"your_token_here\""
    echo
    echo "  # 3. 获取缓存统计"
    echo "  $0 stats"
    echo
    echo "  # 4. 清理特定模式的缓存"
    echo "  $0 clear-pattern \"tmdb:*\""
}

# 主函数
main() {
    case "${1:-help}" in
        login)
            login
            ;;
        stats)
            get_stats "${2:-3600}"
            ;;
        top-keys)
            get_top_keys "${2:-10}"
            ;;
        config)
            get_config
            ;;
        update-config)
            update_config
            ;;
        info)
            get_info
            ;;
        clear-pattern)
            clear_pattern "${2:-user:*}"
            ;;
        clear-all)
            clear_all
            ;;
        warming-status)
            get_warming_status
            ;;
        trigger-warming)
            trigger_warming
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $1"
            echo
            show_help
            exit 1
            ;;
    esac
}

main "$@"
