/**
 * AppleInput 组件使用示例
 * 
 * 本文件展示了 AppleInput 组件的各种使用场景
 */

import { useState } from 'react';
import { AppleInput } from './AppleInput';
import { Search, X, Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';

/**
 * 示例 1: 基础输入框
 */
export function BasicInputExample() {
  const [value, setValue] = useState('');

  return (
    <AppleInput
      label="用户名"
      placeholder="请输入用户名"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

/**
 * 示例 2: 带左侧图标的输入框
 */
export function InputWithLeftIconExample() {
  const [email, setEmail] = useState('');

  return (
    <AppleInput
      label="邮箱"
      type="email"
      placeholder="your@email.com"
      leftIcon={Mail}
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  );
}

/**
 * 示例 3: 搜索框（带清除按钮）
 */
export function SearchInputExample() {
  const [searchValue, setSearchValue] = useState('');

  return (
    <AppleInput
      label="搜索"
      placeholder="搜索用户..."
      leftIcon={Search}
      rightIcon={searchValue ? X : undefined}
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      onRightIconClick={() => setSearchValue('')}
    />
  );
}

/**
 * 示例 4: 密码输入框（带显示/隐藏切换）
 */
export function PasswordInputExample() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AppleInput
      label="密码"
      type={showPassword ? 'text' : 'password'}
      placeholder="请输入密码"
      leftIcon={Lock}
      rightIcon={showPassword ? EyeOff : Eye}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      onRightIconClick={() => setShowPassword(!showPassword)}
      helpText="密码至少 8 个字符"
    />
  );
}

/**
 * 示例 5: 带帮助文本的输入框
 */
export function InputWithHelpTextExample() {
  const [username, setUsername] = useState('');

  return (
    <AppleInput
      label="用户名"
      placeholder="请输入用户名"
      leftIcon={User}
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      helpText="用户名长度为 3-20 个字符，只能包含字母、数字和下划线"
    />
  );
}

/**
 * 示例 6: 错误状态的输入框
 */
export function InputWithErrorExample() {
  const [email, setEmail] = useState('invalid@');

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  return (
    <AppleInput
      label="邮箱"
      type="email"
      placeholder="your@email.com"
      leftIcon={Mail}
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      error={!validateEmail(email) ? '邮箱格式不正确' : undefined}
    />
  );
}

/**
 * 示例 7: 禁用状态的输入框
 */
export function DisabledInputExample() {
  return (
    <AppleInput
      label="用户名"
      placeholder="不可编辑"
      value="admin"
      leftIcon={User}
      disabled
    />
  );
}

/**
 * 示例 8: 完整的登录表单
 */
export function LoginFormExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { email?: string; password?: string } = {};
    
    // 验证邮箱
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = '邮箱格式不正确';
    }
    
    // 验证密码
    if (password.length < 8) {
      newErrors.password = '密码至少 8 个字符';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log('表单提交:', { email, password });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <AppleInput
        label="邮箱"
        type="email"
        placeholder="your@email.com"
        leftIcon={Mail}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />
      
      <AppleInput
        label="密码"
        type={showPassword ? 'text' : 'password'}
        placeholder="至少 8 个字符"
        leftIcon={Lock}
        rightIcon={showPassword ? EyeOff : Eye}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onRightIconClick={() => setShowPassword(!showPassword)}
        error={errors.password}
        required
      />
      
      <button
        type="submit"
        className="w-full bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] py-3 font-medium hover:opacity-90 transition-opacity"
      >
        登录
      </button>
    </form>
  );
}

/**
 * 示例 9: 注册表单
 */
export function RegisterFormExample() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <form className="space-y-4 max-w-md">
      <AppleInput
        label="用户名"
        placeholder="请输入用户名"
        leftIcon={User}
        value={formData.username}
        onChange={handleChange('username')}
        helpText="用户名长度为 3-20 个字符"
        required
      />
      
      <AppleInput
        label="邮箱"
        type="email"
        placeholder="your@email.com"
        leftIcon={Mail}
        value={formData.email}
        onChange={handleChange('email')}
        required
      />
      
      <AppleInput
        label="手机号"
        type="tel"
        placeholder="请输入手机号"
        leftIcon={Phone}
        value={formData.phone}
        onChange={handleChange('phone')}
        helpText="用于接收验证码和通知"
      />
      
      <AppleInput
        label="密码"
        type={showPassword ? 'text' : 'password'}
        placeholder="至少 8 个字符"
        leftIcon={Lock}
        rightIcon={showPassword ? EyeOff : Eye}
        value={formData.password}
        onChange={handleChange('password')}
        onRightIconClick={() => setShowPassword(!showPassword)}
        helpText="密码应包含字母、数字和特殊字符"
        required
      />
      
      <AppleInput
        label="确认密码"
        type={showConfirmPassword ? 'text' : 'password'}
        placeholder="请再次输入密码"
        leftIcon={Lock}
        rightIcon={showConfirmPassword ? EyeOff : Eye}
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
        error={
          formData.confirmPassword &&
          formData.password !== formData.confirmPassword
            ? '两次输入的密码不一致'
            : undefined
        }
        required
      />
      
      <button
        type="submit"
        className="w-full bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] py-3 font-medium hover:opacity-90 transition-opacity"
      >
        注册
      </button>
    </form>
  );
}

/**
 * 示例 10: 自定义尺寸
 */
export function CustomSizeExample() {
  return (
    <div className="space-y-4">
      {/* 小尺寸 */}
      <AppleInput
        label="小尺寸输入框"
        placeholder="小尺寸"
        className="py-2 text-sm"
      />
      
      {/* 默认尺寸 */}
      <AppleInput
        label="默认尺寸输入框"
        placeholder="默认尺寸"
      />
      
      {/* 大尺寸 */}
      <AppleInput
        label="大尺寸输入框"
        placeholder="大尺寸"
        className="py-4 text-lg"
      />
    </div>
  );
}
