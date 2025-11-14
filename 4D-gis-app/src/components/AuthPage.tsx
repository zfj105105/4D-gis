import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogIn, UserPlus, User, Lock, Eye, EyeOff, Mail, Phone, Shield } from 'lucide-react';
import { register, login, authUtils } from '../api/auth';
import { RegisterRequest, LoginRequest } from '../api/authTypes';
import { useMutation } from '@tanstack/react-query';

interface AuthPageProps {
    onLogin: () => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Login form state
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register form state
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPhone, setRegisterPhone] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

    // TanStack Query mutations
    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            authUtils.saveAuthData(data);
            onLogin();
        },
        onError: (error: any) => {
            console.error('登录失败:', error);
        }
    });

    const registerMutation = useMutation({
        mutationFn: register,
        onSuccess: async (_data) => {
            // 注册成功后自动登录
            try {
                const loginResponse = await login({
                    identity: registerUsername,
                    password: registerPassword,
                });
                authUtils.saveAuthData(loginResponse);
                onLogin();
            } catch (error) {
                console.error('自动登录失败:', error);
                // 注册成功但自动登录失败，切换到登录页面
                setActiveTab('login');
            }
        },
        onError: (error: any) => {
            console.error('注册失败:', error);
        }
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const data: LoginRequest = {
            identity: loginIdentifier,
            password: loginPassword,
        };

        loginMutation.mutate(data);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (registerPassword !== registerConfirmPassword) {
            return;
        }

        const data: RegisterRequest = {
            email: registerEmail,
            phone: registerPhone,
            username: registerUsername,
            password: registerPassword,
        };

        registerMutation.mutate(data);
    };

    // 获取错误信息
    const getErrorMessage = () => {
        if (loginMutation.isError) {
            const error = loginMutation.error as any;
            return error.response?.data?.message || '登录失败，请检查您的凭据';
        }
        if (registerMutation.isError) {
            const error = registerMutation.error as any;
            return error.response?.data?.message || '注册失败，请稍后重试';
        }
        if (registerPassword !== registerConfirmPassword && registerConfirmPassword) {
            return '密码不匹配';
        }
        return null;
    };

    // 密码强度检查
    const checkPasswordStrength = (password: string): { score: number; feedback: string[] } => {
        const feedback: string[] = [];
        let score = 0;

        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push('密码至少需要8个字符');
        }

        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('需要包含大写字母');
        }

        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('需要包含小写字母');
        }

        if (/\d/.test(password)) {
            score += 1;
        } else {
            feedback.push('需要包含数字');
        }

        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            score += 1;
        } else {
            feedback.push('建议包含特殊字符');
        }

        return { score, feedback };
    };

    const getPasswordStrengthColor = (score: number): string => {
        if (score <= 2) return 'text-red-500';
        if (score <= 3) return 'text-yellow-500';
        return 'text-green-500';
    };

    const getPasswordStrengthText = (score: number): string => {
        if (score <= 2) return '弱';
        if (score <= 3) return '中等';
        return '强';
    };

    const passwordStrength = checkPasswordStrength(registerPassword);

    const isLoading = loginMutation.isPending || registerMutation.isPending;
    const errorMessage = getErrorMessage();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="mb-3">Welcome</h1>
                    <p className="text-muted-foreground">
                        Sign in to your account or create a new one
                    </p>
                </div>

                {/* Auth Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="login" className="flex items-center gap-2">
                                <LogIn className="h-4 w-4" />
                                Login
                            </TabsTrigger>
                            <TabsTrigger value="register" className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Register
                            </TabsTrigger>
                        </TabsList>

                        {/* Login Tab */}
                        <TabsContent value="login" className="space-y-4">
                            <div>
                                <h2 className="mb-2">Sign In</h2>
                                <p className="text-sm text-muted-foreground">
                                    Enter your credentials to access your account
                                </p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-identifier">Username / Email / Phone</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="login-identifier"
                                            type="text"
                                            placeholder="Enter username, email or phone"
                                            value={loginIdentifier}
                                            onChange={(e) => setLoginIdentifier(e.target.value)}
                                            className="pl-10 bg-slate-50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="login-password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            className="pl-10 pr-10 bg-slate-50"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            checked={rememberMe}
                                            onCheckedChange={(checked: boolean) => setRememberMe(checked as boolean)}
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="text-sm cursor-pointer"
                                        >
                                            Remember me
                                        </Label>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="p-0 h-auto text-sm"
                                    >
                                        Forgot password?
                                    </Button>
                                </div>

                                {errorMessage && (
                                    <div className="text-red-500 text-sm">
                                        {errorMessage}
                                    </div>
                                )}

                                <Button type="submit" className="w-full bg-black hover:bg-black/90 text-white" disabled={isLoading}>
                                    {isLoading ? 'Signing in...' : (
                                        <>
                                            <LogIn className="h-4 w-4 mr-2" />
                                            Sign In
                                        </>
                                    )}
                                </Button>
                            </form>
                        </TabsContent>

                        {/* Register Tab */}
                        <TabsContent value="register" className="space-y-4">
                            <div>
                                <h2 className="mb-2">Create Account</h2>
                                <p className="text-sm text-muted-foreground">
                                    Fill in the information below to create your account
                                </p>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="register-email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="register-email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={registerEmail}
                                            onChange={(e) => setRegisterEmail(e.target.value)}
                                            className="pl-10 bg-slate-50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-phone">Phone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="register-phone"
                                            type="tel"
                                            placeholder="Enter your phone number"
                                            value={registerPhone}
                                            onChange={(e) => setRegisterPhone(e.target.value)}
                                            className="pl-10 bg-slate-50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-username">Username</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="register-username"
                                            type="text"
                                            placeholder="Choose a username"
                                            value={registerUsername}
                                            onChange={(e) => setRegisterUsername(e.target.value)}
                                            className="pl-10 bg-slate-50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="register-password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Create a password"
                                            value={registerPassword}
                                            onChange={(e) => setRegisterPassword(e.target.value)}
                                            className="pl-10 pr-10 bg-slate-50"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="register-confirm-password"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Confirm your password"
                                            value={registerConfirmPassword}
                                            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                                            className="pl-10 pr-10 bg-slate-50"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Strength Indicator */}
                                <div className="space-y-2">
                                    <Label>Password Strength</Label>
                                    <div className="flex items-center">
                                        <div className="w-full bg-slate-200 rounded-full h-2.5 mr-2">
                                            <div
                                                className={`h-2.5 rounded-full ${getPasswordStrengthColor(passwordStrength.score)}`}
                                                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                            />
                                        </div>
                                        <span className={`text-xs ${getPasswordStrengthColor(passwordStrength.score)}`}>
                                            {getPasswordStrengthText(passwordStrength.score)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {passwordStrength.feedback.map((line, index) => (
                                            <div key={index} className="flex items-center">
                                                <Shield className="h-4 w-4 mr-1" />
                                                {line}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {errorMessage && (
                                    <div className="text-red-500 text-sm">
                                        {errorMessage}
                                    </div>
                                )}

                                <Button type="submit" className="w-full bg-black hover:bg-black/90 text-white" disabled={isLoading}>
                                    {isLoading ? 'Creating account...' : (
                                        <>
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Create Account
                                        </>
                                    )}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
}
