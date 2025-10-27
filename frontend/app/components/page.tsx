/**
 * 组件展示页面
 * 
 * 展示所有已安装的 shadcn/ui 组件和自定义组件
 */

import { Metadata } from 'next'
import { Container } from '@/components/common/Container'
import { PageHeader } from '@/components/common/PageHeader'
import { ComponentsShowcase } from './ComponentsShowcase'

export const metadata: Metadata = {
  title: '组件库 - 阅影·log',
  description: '查看所有可用的 UI 组件',
}

export default function ComponentsPage() {
  return (
    <Container className="py-8">
      <PageHeader
        title="组件库"
        description="shadcn/ui 组件库和自定义组件展示"
      />
      <div className="mt-8">
        <ComponentsShowcase />
      </div>
    </Container>
  )
}


