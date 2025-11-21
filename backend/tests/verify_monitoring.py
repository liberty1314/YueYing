"""
验证监控功能是否正常工作
运行此脚本来测试性能监控中间件
"""
import asyncio
import httpx
import time
from rich.console import Console
from rich.table import Table
from rich.progress import track

console = Console()

BASE_URL = "http://localhost:8000"

async def test_api_calls():
    """发送一些测试请求"""
    console.print("\n[bold blue]📊 发送测试请求...[/bold blue]")
    
    async with httpx.AsyncClient() as client:
        # 发送多个请求
        endpoints = [
            "/api/health",
            "/api/health/detailed",
            "/api/health/performance",
            "/docs",
        ]
        
        for _ in track(range(20), description="发送请求中"):
            for endpoint in endpoints:
                try:
                    response = await client.get(f"{BASE_URL}{endpoint}")
                    # 查看响应头中的性能信息
                    if "X-Response-Time" in response.headers:
                        console.print(f"✓ {endpoint}: {response.headers['X-Response-Time']}", style="green")
                except Exception as e:
                    console.print(f"✗ {endpoint}: {str(e)}", style="red")
            
            await asyncio.sleep(0.1)

async def check_metrics():
    """检查性能指标"""
    console.print("\n[bold blue]📈 获取性能指标...[/bold blue]\n")
    
    async with httpx.AsyncClient() as client:
        try:
            # 获取性能指标
            response = await client.get(f"{BASE_URL}/api/health/performance")
            if response.status_code == 200:
                metrics = response.json()
                
                # 创建表格
                table = Table(title="性能指标")
                table.add_column("指标", style="cyan")
                table.add_column("值", style="magenta")
                table.add_column("状态", style="green")
                
                # 添加数据
                table.add_row(
                    "API响应时间",
                    f"{metrics.get('api_response_time_avg', 0):.2f}ms",
                    "✓ 优秀" if metrics.get('api_response_time_avg', 0) < 200 else "⚠ 一般"
                )
                table.add_row(
                    "缓存命中率",
                    f"{metrics.get('cache_hit_rate', 0):.2f}%",
                    "✓ 良好" if metrics.get('cache_hit_rate', 0) > 60 else "⚠ 需优化"
                )
                table.add_row(
                    "内存使用",
                    f"{metrics.get('memory_usage_percent', 0):.2f}%",
                    "✓ 正常" if metrics.get('memory_usage_percent', 0) < 80 else "⚠ 警告"
                )
                table.add_row(
                    "请求速率",
                    f"{metrics.get('request_count_minute', 0):.2f}/min",
                    "✓ 稳定"
                )
                table.add_row(
                    "数据库连接",
                    str(metrics.get('db_connection_count', 0)),
                    "✓ 正常"
                )
                
                console.print(table)
                
                # 显示端点统计
                if metrics.get('top_endpoints'):
                    console.print("\n[bold blue]🔝 高频端点 (Top 5)[/bold blue]\n")
                    
                    endpoint_table = Table()
                    endpoint_table.add_column("端点", style="cyan")
                    endpoint_table.add_column("方法", style="yellow")
                    endpoint_table.add_column("请求数", style="magenta")
                    endpoint_table.add_column("平均响应", style="green")
                    
                    for ep in metrics['top_endpoints'][:5]:
                        endpoint_table.add_row(
                            ep['endpoint'],
                            ep['method'],
                            str(ep['total_requests']),
                            f"{ep['avg_response_time']:.2f}ms"
                        )
                    
                    console.print(endpoint_table)
            else:
                console.print(f"[red]✗ 获取性能指标失败: {response.status_code}[/red]")
        
        except Exception as e:
            console.print(f"[red]✗ 错误: {str(e)}[/red]")

async def check_endpoints_metrics():
    """检查端点指标"""
    console.print("\n[bold blue]🎯 端点性能统计...[/bold blue]\n")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/api/health/metrics/endpoints")
            if response.status_code == 200:
                data = response.json()
                console.print(f"[green]✓ 共监控 {data['total']} 个端点[/green]")
                
                if data['endpoints']:
                    table = Table()
                    table.add_column("端点", style="cyan", no_wrap=True)
                    table.add_column("方法", style="yellow")
                    table.add_column("请求数", justify="right")
                    table.add_column("平均(ms)", justify="right")
                    table.add_column("最大(ms)", justify="right")
                    
                    for ep in data['endpoints'][:10]:
                        table.add_row(
                            ep['endpoint'],
                            ep['method'],
                            str(ep['total_requests']),
                            f"{ep['avg_response_time']:.2f}",
                            f"{ep['max_response_time']:.2f}"
                        )
                    
                    console.print(table)
            else:
                console.print(f"[red]✗ 获取端点统计失败: {response.status_code}[/red]")
        
        except Exception as e:
            console.print(f"[red]✗ 错误: {str(e)}[/red]")

async def check_rpm_metrics():
    """检查RPM指标"""
    console.print("\n[bold blue]⚡ 请求速率统计...[/bold blue]\n")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/api/health/metrics/rpm?minutes=5")
            if response.status_code == 200:
                data = response.json()
                
                console.print(f"[green]✓ 平均请求速率: {data['rpm_avg']:.2f} RPM[/green]")
                console.print(f"[green]✓ 总请求数: {data['total_requests']}[/green]")
                
                if data['rpm_data']:
                    console.print("\n最近5分钟:")
                    for item in data['rpm_data'][-5:]:
                        console.print(f"  {item['minute']}: {item['requests']} 请求")
            else:
                console.print(f"[red]✗ 获取RPM统计失败: {response.status_code}[/red]")
        
        except Exception as e:
            console.print(f"[red]✗ 错误: {str(e)}[/red]")

async def main():
    """主函数"""
    console.print("[bold green]" + "="*60 + "[/bold green]")
    console.print("[bold green]  月影系统 - 性能监控验证工具[/bold green]")
    console.print("[bold green]" + "="*60 + "[/bold green]")
    
    # 检查服务是否运行
    console.print("\n[bold blue]🔍 检查服务状态...[/bold blue]")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/api/health", timeout=5.0)
            if response.status_code == 200:
                console.print("[green]✓ 后端服务正在运行[/green]")
            else:
                console.print(f"[red]✗ 服务响应异常: {response.status_code}[/red]")
                return
    except Exception as e:
        console.print(f"[red]✗ 无法连接到后端服务: {str(e)}[/red]")
        console.print("[yellow]请确保后端服务正在运行: uvicorn app.main:app[/yellow]")
        return
    
    # 发送测试请求
    await test_api_calls()
    
    # 等待一下让数据写入Redis
    console.print("\n[yellow]⏳ 等待数据处理...[/yellow]")
    await asyncio.sleep(2)
    
    # 检查各种指标
    await check_metrics()
    await check_endpoints_metrics()
    await check_rpm_metrics()
    
    console.print("\n[bold green]" + "="*60 + "[/bold green]")
    console.print("[bold green]  ✓ 监控功能验证完成！[/bold green]")
    console.print("[bold green]" + "="*60 + "[/bold green]")
    
    console.print("\n[bold blue]💡 提示:[/bold blue]")
    console.print("  • 访问 http://localhost:3000/admin/performance 查看监控面板")
    console.print("  • 运行 ./tests/run_tests.sh 执行完整测试")
    console.print("  • 查看 MONITORING_AND_TESTING_IMPLEMENTATION.md 了解详情")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        console.print("\n[yellow]⚠ 用户中断[/yellow]")
    except Exception as e:
        console.print(f"\n[red]✗ 错误: {str(e)}[/red]")
