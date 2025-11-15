#!/usr/bin/env python3
"""
缓存测试运行器

运行所有缓存相关的测试并生成报告
"""
import sys
import subprocess
import argparse
from pathlib import Path
from typing import List, Dict


class Colors:
    """终端颜色"""
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'  # No Color


class TestRunner:
    """测试运行器"""
    
    def __init__(self, verbose: bool = False, coverage: bool = False):
        self.verbose = verbose
        self.coverage = coverage
        self.results: Dict[str, bool] = {}
        
        # 项目根目录
        self.root_dir = Path(__file__).parent.parent
        
    def print_header(self, text: str):
        """打印标题"""
        print(f"\n{Colors.BLUE}{'=' * 60}{Colors.NC}")
        print(f"{Colors.BLUE}{text}{Colors.NC}")
        print(f"{Colors.BLUE}{'=' * 60}{Colors.NC}\n")
    
    def print_section(self, text: str):
        """打印章节"""
        print(f"{Colors.GREEN}{text}{Colors.NC}\n")
    
    def print_test(self, text: str):
        """打印测试名称"""
        print(f"{Colors.YELLOW}{text}{Colors.NC}")
    
    def print_success(self, text: str):
        """打印成功消息"""
        print(f"{Colors.GREEN}✓ {text}{Colors.NC}")
    
    def print_error(self, text: str):
        """打印错误消息"""
        print(f"{Colors.RED}✗ {text}{Colors.NC}")
    
    def run_pytest(self, test_file: str, name: str) -> bool:
        """运行 pytest"""
        cmd = ["pytest", test_file, "--tb=short"]
        
        if self.verbose:
            cmd.append("-v")
        
        if self.coverage:
            cmd.extend([
                "--cov=app.core",
                "--cov=app.services",
                "--cov-report=html",
                "--cov-report=term",
            ])
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.root_dir,
                capture_output=not self.verbose,
                text=True,
            )
            
            success = result.returncode == 0
            self.results[name] = success
            
            if success:
                self.print_success(f"{name} 通过")
            else:
                self.print_error(f"{name} 失败")
                if not self.verbose and result.stdout:
                    print(result.stdout)
                if result.stderr:
                    print(result.stderr)
            
            return success
            
        except Exception as e:
            self.print_error(f"{name} 执行失败: {e}")
            self.results[name] = False
            return False
    
    def run_unit_tests(self) -> bool:
        """运行单元测试"""
        self.print_section("运行单元测试...")
        
        tests = [
            ("tests/test_cache_stats.py", "缓存统计测试"),
            ("tests/test_memory_cache.py", "内存缓存测试"),
            ("tests/test_multi_level_cache.py", "多级缓存测试"),
            ("tests/test_cache_key_generator.py", "缓存键生成器测试"),
            ("tests/test_cache_config.py", "缓存配置测试"),
            ("tests/test_cache_warming.py", "缓存预热测试"),
        ]
        
        all_passed = True
        for test_file, name in tests:
            self.print_test(f"{len(self.results) + 1}. {name}")
            if not self.run_pytest(test_file, name):
                all_passed = False
            print()
        
        return all_passed
    
    def run_integration_tests(self) -> bool:
        """运行集成测试"""
        self.print_section("运行集成测试...")
        
        tests = [
            ("tests/test_cache_integration.py", "缓存集成测试"),
            ("tests/test_cache_end_to_end.py", "端到端缓存测试"),
        ]
        
        all_passed = True
        for test_file, name in tests:
            self.print_test(f"{len(self.results) + 1}. {name}")
            if not self.run_pytest(test_file, name):
                all_passed = False
            print()
        
        return all_passed
    
    def run_performance_tests(self) -> bool:
        """运行性能测试"""
        self.print_section("运行性能测试...")
        print(f"{Colors.YELLOW}注意: 性能测试可能需要较长时间{Colors.NC}\n")
        
        tests = [
            ("tests/test_cache_performance.py", "缓存性能测试"),
        ]
        
        all_passed = True
        for test_file, name in tests:
            self.print_test(f"{len(self.results) + 1}. {name}")
            # 性能测试需要显示输出
            cmd = ["pytest", test_file, "--tb=short", "-s"]
            if self.verbose:
                cmd.append("-v")
            
            try:
                result = subprocess.run(cmd, cwd=self.root_dir)
                success = result.returncode == 0
                self.results[name] = success
                
                if success:
                    self.print_success(f"{name} 通过")
                else:
                    self.print_error(f"{name} 失败")
                    all_passed = False
            except Exception as e:
                self.print_error(f"{name} 执行失败: {e}")
                self.results[name] = False
                all_passed = False
            
            print()
        
        return all_passed
    
    def print_summary(self):
        """打印测试总结"""
        self.print_header("测试总结")
        
        passed = sum(1 for v in self.results.values() if v)
        failed = sum(1 for v in self.results.values() if not v)
        total = len(self.results)
        
        print(f"总测试套件: {total}")
        print(f"通过: {Colors.GREEN}{passed}{Colors.NC}")
        print(f"失败: {Colors.RED}{failed}{Colors.NC}")
        print()
        
        if failed == 0:
            self.print_success("所有测试通过！")
        else:
            self.print_error(f"{failed} 个测试套件失败")
            print("\n失败的测试:")
            for name, success in self.results.items():
                if not success:
                    print(f"  - {name}")
        
        print()
        
        if self.coverage:
            print(f"{Colors.GREEN}覆盖率报告已生成: htmlcov/index.html{Colors.NC}\n")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="运行缓存系统测试")
    parser.add_argument(
        "--unit",
        action="store_true",
        help="只运行单元测试"
    )
    parser.add_argument(
        "--integration",
        action="store_true",
        help="只运行集成测试"
    )
    parser.add_argument(
        "--performance",
        action="store_true",
        help="只运行性能测试"
    )
    parser.add_argument(
        "--coverage",
        action="store_true",
        help="生成覆盖率报告"
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="详细输出"
    )
    
    args = parser.parse_args()
    
    # 如果没有指定测试类型，运行单元测试和集成测试
    run_unit = args.unit or not (args.integration or args.performance)
    run_integration = args.integration or not (args.unit or args.performance)
    run_performance = args.performance
    
    runner = TestRunner(verbose=args.verbose, coverage=args.coverage)
    
    runner.print_header("缓存系统测试")
    
    all_passed = True
    
    if run_unit:
        if not runner.run_unit_tests():
            all_passed = False
    
    if run_integration:
        if not runner.run_integration_tests():
            all_passed = False
    
    if run_performance:
        if not runner.run_performance_tests():
            all_passed = False
    
    runner.print_summary()
    
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
