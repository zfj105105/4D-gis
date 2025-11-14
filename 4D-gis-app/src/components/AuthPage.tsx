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
        onSuccess: async (data) => {
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

    const handleSocialLogin = (provider: string) => {
        // Simulate social login
        console.log(`Login with ${provider}`);
        onLogin();
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

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-muted-foreground">
                    Or continue with
                  </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleSocialLogin('Google')}
                                    className="w-full"
                                >
                                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Google
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleSocialLogin('GitHub')}
                                    className="w-full"
                                >
                                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                    GitHub
                                </Button>
                            </div>
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

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-muted-foreground">
                    Or continue with
                  </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleSocialLogin('Google')}
                                    className="w-full"
                                >
                                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Google
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleSocialLogin('GitHub')}
                                    className="w-full"
                                >
                                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                    GitHub
                                </Button>
                            </div>
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
