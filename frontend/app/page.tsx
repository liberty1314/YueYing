export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">阅影·log</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          AI驱动的个人娱乐记录平台
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>🤖 智能标签生成</p>
          <p>🎯 个性化推荐</p>
          <p>💬 AI对话助手</p>
          <p>🔒 隐私至上</p>
        </div>
      </div>
    </main>
  )
}

