/**
 * AppleSelect 组件使用示例
 * 
 * 这个文件展示了 AppleSelect 组件的各种使用场景
 */

'use client';

import { useState } from 'react';
import { AppleSelect, type SelectOption } from './AppleSelect';

/**
 * 示例 1: 基础用法
 */
export function BasicExample() {
  const [value, setValue] = useState('');

  const options: SelectOption[] = [
    { label: '选项 1', value: '1' },
    { label: '选项 2', value: '2' },
    { label: '选项 3', value: '3' },
  ];

  return (
    <AppleSelect
      value={value}
      onValueChange={setValue}
      options={options}
      placeholder="请选择一个选项"
    />
  );
}

/**
 * 示例 2: 带标签和帮助文本
 */
export function LabeledExample() {
  const [role, setRole] = useState('user');

  const roleOptions: SelectOption[] = [
    { label: '管理员', value: 'admin' },
    { label: '普通用户', value: 'user' },
    { label: '访客', value: 'guest' },
  ];

  return (
    <AppleSelect
      label="用户角色"
      helpText="选择用户的角色类型"
      value={role}
      onValueChange={setRole}
      options={roleOptions}
      name="role"
    />
  );
}

/**
 * 示例 3: 错误状态
 */
export function ErrorExample() {
  const [status, setStatus] = useState('');

  const statusOptions: SelectOption[] = [
    { label: '活跃', value: 'active' },
    { label: '待审核', value: 'pending' },
    { label: '已禁用', value: 'disabled' },
  ];

  return (
    <AppleSelect
      label="状态"
      error={!status ? '请选择一个状态' : undefined}
      value={status}
      onValueChange={setStatus}
      options={statusOptions}
      name="status"
    />
  );
}

/**
 * 示例 4: 禁用状态
 */
export function DisabledExample() {
  const options: SelectOption[] = [
    { label: '禁用选项', value: 'disabled' },
  ];

  return (
    <AppleSelect
      label="禁用的选择框"
      helpText="此选择框已被禁用"
      value="disabled"
      onValueChange={() => {}}
      options={options}
      disabled
    />
  );
}

/**
 * 示例 5: 禁用特定选项
 */
export function DisabledOptionsExample() {
  const [value, setValue] = useState('');

  const options: SelectOption[] = [
    { label: '可用选项 1', value: '1' },
    { label: '可用选项 2', value: '2' },
    { label: '禁用选项', value: '3', disabled: true },
    { label: '可用选项 3', value: '4' },
  ];

  return (
    <AppleSelect
      label="部分选项禁用"
      value={value}
      onValueChange={setValue}
      options={options}
    />
  );
}

/**
 * 示例 6: 表单集成（React Hook Form）
 */
export function FormExample() {
  // 这个示例展示了如何与 React Hook Form 集成
  // 实际使用时需要导入 useForm 和 Controller
  
  const [formValue, setFormValue] = useState('');

  const options: SelectOption[] = [
    { label: '选项 A', value: 'a' },
    { label: '选项 B', value: 'b' },
    { label: '选项 C', value: 'c' },
  ];

  return (
    <form onSubmit={(e) => { e.preventDefault(); alert(`提交的值: ${formValue}`); }}>
      <AppleSelect
        label="表单字段"
        helpText="这是一个表单字段示例"
        value={formValue}
        onValueChange={setFormValue}
        options={options}
        name="formField"
      />
      <button
        type="submit"
        className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-white"
      >
        提交
      </button>
    </form>
  );
}

/**
 * 示例 7: 多个选择框组合
 */
export function MultipleSelectsExample() {
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  const countryOptions: SelectOption[] = [
    { label: '中国', value: 'cn' },
    { label: '美国', value: 'us' },
    { label: '日本', value: 'jp' },
  ];

  const cityOptions: SelectOption[] = [
    { label: '北京', value: 'beijing' },
    { label: '上海', value: 'shanghai' },
    { label: '深圳', value: 'shenzhen' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <AppleSelect
        label="国家"
        value={country}
        onValueChange={setCountry}
        options={countryOptions}
      />
      <AppleSelect
        label="城市"
        value={city}
        onValueChange={setCity}
        options={cityOptions}
      />
    </div>
  );
}
