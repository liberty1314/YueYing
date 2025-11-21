"""
使用Locust进行负载测试

安装: pip install locust

运行方法:
1. 命令行模式:
   locust -f locustfile.py --headless --users 10 --spawn-rate 2 --run-time 60s --host http://localhost:8000

2. Web界面模式:
   locust -f locustfile.py --host http://localhost:8000
   然后访问 http://localhost:8089
"""

from locust import HttpUser, task, between, events
import random
import string
import json
from datetime import datetime


class YueYingUser(HttpUser):
    """月影系统用户行为模拟"""
    
    # 等待时间（模拟真实用户思考时间）
    wait_time = between(1, 3)
    
    # 权重配置
    weight = 1
    
    def on_start(self):
        """用户启动时执行：注册/登录"""
        self.token = None
        self.item_ids = []
        
        # 生成随机用户名
        random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        self.username = f"locust_user_{random_suffix}"
        self.password = "LoadTest123!"
        self.email = f"{self.username}@example.com"
        
        # 注册
        response = self.client.post(
            "/api/auth/register",
            json={
                "username": self.username,
                "email": self.email,
                "password": self.password,
            },
            name="注册用户"
        )
        
        if response.status_code == 200:
            self.token = response.json().get("access_token")
        else:
            # 如果注册失败，尝试登录
            response = self.client.post(
                "/api/auth/login",
                data={
                    "username": self.username,
                    "password": self.password,
                },
                name="用户登录"
            )
            if response.status_code == 200:
                self.token = response.json().get("access_token")
    
    def get_headers(self):
        """获取认证头"""
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}
    
    @task(10)
    def view_items(self):
        """查看物品列表（高频操作）"""
        if not self.token:
            return
        
        params = {
            "skip": random.randint(0, 20),
            "limit": random.randint(10, 50),
        }
        
        self.client.get(
            "/api/items/",
            params=params,
            headers=self.get_headers(),
            name="查看物品列表"
        )
    
    @task(5)
    def create_item(self):
        """创建物品（中频操作）"""
        if not self.token:
            return
        
        categories = ['books', 'electronics', 'sports', 'clothing', 'toys']
        
        item_data = {
            "name": f"Load Test Item {random.randint(1, 10000)}",
            "description": "This is a test item created by load testing",
            "category": random.choice(categories),
            "acquisition_date": datetime.now().strftime("%Y-%m-%d"),
            "price": round(random.uniform(10, 1000), 2),
            "location": f"Location {random.randint(1, 100)}",
        }
        
        response = self.client.post(
            "/api/items/",
            json=item_data,
            headers=self.get_headers(),
            name="创建物品"
        )
        
        if response.status_code == 200:
            item_id = response.json().get("id")
            if item_id:
                self.item_ids.append(item_id)
    
    @task(8)
    def view_item_detail(self):
        """查看物品详情（高频操作）"""
        if not self.token or not self.item_ids:
            return
        
        item_id = random.choice(self.item_ids)
        self.client.get(
            f"/api/items/{item_id}",
            headers=self.get_headers(),
            name="查看物品详情"
        )
    
    @task(3)
    def update_item(self):
        """更新物品（低频操作）"""
        if not self.token or not self.item_ids:
            return
        
        item_id = random.choice(self.item_ids)
        update_data = {
            "name": f"Updated Item {random.randint(1, 1000)}",
            "location": f"New Location {random.randint(1, 100)}",
        }
        
        self.client.put(
            f"/api/items/{item_id}",
            json=update_data,
            headers=self.get_headers(),
            name="更新物品"
        )
    
    @task(2)
    def delete_item(self):
        """删除物品（低频操作）"""
        if not self.token or not self.item_ids:
            return
        
        item_id = self.item_ids.pop(random.randint(0, len(self.item_ids) - 1))
        self.client.delete(
            f"/api/items/{item_id}",
            headers=self.get_headers(),
            name="删除物品"
        )
    
    @task(6)
    def search_items(self):
        """搜索物品（中频操作）"""
        if not self.token:
            return
        
        search_terms = ['book', 'phone', 'camera', 'test', 'item']
        params = {
            "search": random.choice(search_terms),
            "limit": 20,
        }
        
        self.client.get(
            "/api/items/",
            params=params,
            headers=self.get_headers(),
            name="搜索物品"
        )
    
    @task(4)
    def get_recommendations(self):
        """获取推荐（中频操作）"""
        if not self.token:
            return
        
        self.client.get(
            "/api/recommendations/",
            headers=self.get_headers(),
            name="获取推荐"
        )
    
    @task(3)
    def get_stats(self):
        """查看统计数据（中频操作）"""
        if not self.token:
            return
        
        time_periods = ['week', 'month', '3months']
        params = {
            "time_period": random.choice(time_periods),
        }
        
        self.client.get(
            "/api/stats/comprehensive",
            params=params,
            headers=self.get_headers(),
            name="查看统计数据"
        )
    
    @task(1)
    def get_user_profile(self):
        """查看用户信息（低频操作）"""
        if not self.token:
            return
        
        self.client.get(
            "/api/auth/me",
            headers=self.get_headers(),
            name="查看用户信息"
        )


class AdminUser(HttpUser):
    """管理员用户行为模拟"""
    
    wait_time = between(2, 5)
    weight = 1  # 管理员数量较少
    
    def on_start(self):
        """管理员登录"""
        self.token = None
        
        # 使用管理员账号登录
        response = self.client.post(
            "/api/auth/login",
            data={
                "username": "admin",
                "password": "admin123",  # 使用实际的管理员密码
            },
            name="管理员登录"
        )
        
        if response.status_code == 200:
            self.token = response.json().get("access_token")
    
    def get_headers(self):
        """获取认证头"""
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}
    
    @task(5)
    def view_admin_stats(self):
        """查看管理统计"""
        if not self.token:
            return
        
        self.client.get(
            "/api/admin/stats",
            headers=self.get_headers(),
            name="管理统计"
        )
    
    @task(3)
    def view_performance_metrics(self):
        """查看性能指标"""
        if not self.token:
            return
        
        self.client.get(
            "/api/health/performance",
            headers=self.get_headers(),
            name="性能指标"
        )
    
    @task(2)
    def view_endpoint_metrics(self):
        """查看端点统计"""
        if not self.token:
            return
        
        self.client.get(
            "/api/health/metrics/endpoints",
            headers=self.get_headers(),
            name="端点统计"
        )
    
    @task(2)
    def view_rpm_metrics(self):
        """查看请求速率"""
        if not self.token:
            return
        
        self.client.get(
            "/api/health/metrics/rpm",
            params={"minutes": 30},
            headers=self.get_headers(),
            name="请求速率"
        )


class AnonymousUser(HttpUser):
    """匿名用户（未登录）"""
    
    wait_time = between(1, 2)
    weight = 2  # 匿名用户较多
    
    @task(10)
    def health_check(self):
        """健康检查"""
        self.client.get(
            "/api/health",
            name="健康检查"
        )
    
    @task(3)
    def view_docs(self):
        """查看API文档"""
        self.client.get(
            "/docs",
            name="API文档"
        )


# 事件监听器：自定义统计
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """测试开始时"""
    print("🚀 负载测试开始...")
    print(f"目标主机: {environment.host}")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """测试结束时"""
    print("\n" + "=" * 50)
    print("📊 负载测试完成")
    print("=" * 50)
    
    stats = environment.stats
    
    print(f"\n总请求数: {stats.total.num_requests}")
    print(f"失败请求数: {stats.total.num_failures}")
    print(f"请求速率: {stats.total.total_rps:.2f} RPS")
    
    print(f"\n响应时间:")
    print(f"  平均: {stats.total.avg_response_time:.2f}ms")
    print(f"  最小: {stats.total.min_response_time:.2f}ms")
    print(f"  最大: {stats.total.max_response_time:.2f}ms")
    print(f"  50%: {stats.total.get_response_time_percentile(0.5):.2f}ms")
    print(f"  95%: {stats.total.get_response_time_percentile(0.95):.2f}ms")
    print(f"  99%: {stats.total.get_response_time_percentile(0.99):.2f}ms")
    
    print("\n" + "=" * 50)
