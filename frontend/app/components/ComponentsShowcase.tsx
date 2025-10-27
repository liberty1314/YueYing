'use client'

/**
 * 组件展示
 * 
 * 展示所有组件的使用示例
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Loading } from '@/components/ui/loading'
import { Empty } from '@/components/ui/empty'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

export function ComponentsShowcase() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  return (
    <Tabs defaultValue="buttons" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="buttons">按钮</TabsTrigger>
        <TabsTrigger value="forms">表单</TabsTrigger>
        <TabsTrigger value="layout">布局</TabsTrigger>
        <TabsTrigger value="feedback">反馈</TabsTrigger>
      </TabsList>

      {/* 按钮标签页 */}
      <TabsContent value="buttons" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Button 按钮</CardTitle>
            <CardDescription>不同样式和大小的按钮组件</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button>默认按钮</Button>
              <Button variant="secondary">次要按钮</Button>
              <Button variant="destructive">危险按钮</Button>
              <Button variant="outline">边框按钮</Button>
              <Button variant="ghost">幽灵按钮</Button>
              <Button variant="link">链接按钮</Button>
            </div>
            <Separator />
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">小按钮</Button>
              <Button size="default">默认大小</Button>
              <Button size="lg">大按钮</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badge 徽章</CardTitle>
            <CardDescription>用于显示状态或标签</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge>默认</Badge>
              <Badge variant="secondary">次要</Badge>
              <Badge variant="destructive">危险</Badge>
              <Badge variant="outline">边框</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avatar 头像</CardTitle>
            <CardDescription>显示用户头像</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 表单标签页 */}
      <TabsContent value="forms" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Input 输入框</CardTitle>
            <CardDescription>文本输入组件</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select 选择器</CardTitle>
            <CardDescription>下拉选择组件</CardDescription>
          </CardHeader>
          <CardContent>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="选择一个选项" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">选项 1</SelectItem>
                <SelectItem value="option2">选项 2</SelectItem>
                <SelectItem value="option3">选项 3</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Textarea 文本域</CardTitle>
            <CardDescription>多行文本输入</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="输入您的评论..." rows={4} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checkbox 复选框</CardTitle>
            <CardDescription>单选和多选</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms">同意条款和条件</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="marketing" />
              <Label htmlFor="marketing">接收营销邮件</Label>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 布局标签页 */}
      <TabsContent value="layout" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Card 卡片</CardTitle>
            <CardDescription>内容容器组件</CardDescription>
          </CardHeader>
          <CardContent>
            <Card>
              <CardHeader>
                <CardTitle>卡片标题</CardTitle>
                <CardDescription>卡片描述文本</CardDescription>
              </CardHeader>
              <CardContent>
                <p>这是卡片的内容区域。</p>
              </CardContent>
              <CardFooter>
                <Button>操作按钮</Button>
              </CardFooter>
            </Card>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Separator 分隔线</CardTitle>
            <CardDescription>分隔不同内容区域</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>内容区域 1</div>
            <Separator />
            <div>内容区域 2</div>
            <Separator />
            <div>内容区域 3</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empty 空状态</CardTitle>
            <CardDescription>显示空状态提示</CardDescription>
          </CardHeader>
          <CardContent>
            <Empty
              title="暂无内容"
              description="这里还没有任何数据"
              action={{
                label: '添加内容',
                onClick: () => toast({ title: '点击了添加按钮' }),
              }}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* 反馈标签页 */}
      <TabsContent value="feedback" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Alert 警告</CardTitle>
            <CardDescription>提示和警告消息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTitle>提示</AlertTitle>
              <AlertDescription>
                这是一个普通的提示消息。
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>错误</AlertTitle>
              <AlertDescription>
                这是一个错误提示消息。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dialog 对话框</CardTitle>
            <CardDescription>模态对话框组件</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>打开对话框</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>对话框标题</DialogTitle>
                  <DialogDescription>
                    这是对话框的描述文本。
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p>对话框内容区域</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>确认</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Toast 提示</CardTitle>
            <CardDescription>轻量级提示消息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() =>
                toast({
                  title: '成功',
                  description: '操作已成功完成',
                })
              }
            >
              显示 Toast
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                toast({
                  title: '错误',
                  description: '操作失败，请重试',
                  variant: 'destructive',
                })
              }
            >
              显示错误 Toast
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loading 加载</CardTitle>
            <CardDescription>加载状态指示器</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Loading size="sm" />
              <Loading size="md" />
              <Loading size="lg" />
            </div>
            <Loading text="加载中..." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skeleton 骨架屏</CardTitle>
            <CardDescription>加载占位组件</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}


