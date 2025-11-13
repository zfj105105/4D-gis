import {useState, useEffect} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from './ui/dialog';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Label} from './ui/label';
import {Separator} from './ui/separator';
import {Badge} from './ui/badge';
import {Check, Copy, ExternalLink, Share2, QrCode, Download} from 'lucide-react';
import {toast} from "sonner";
import type {Marker} from '../api/marker';

interface SharingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    marker: Marker | null;
}

interface ShareMethod {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
}

export function SharingDialog({open, onOpenChange, marker}: SharingDialogProps) {
    const [selectedMethod, setSelectedMethod] = useState<string>('link');
    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    const shareMethods: ShareMethod[] = [
        {
            id: 'link',
            name: '分享链接',
            description: '生成包含标记数据的链接',
            icon: <ExternalLink className="h-4 w-4" />
        },
        {
            id: 'qr',
            name: '二维码',
            description: '生成二维码供扫描访问',
            icon: <QrCode className="h-4 w-4" />
        },
        {
            id: 'export',
            name: '导出数据',
            description: '导出标记为JSON文件',
            icon: <Download className="h-4 w-4" />
        }
    ];

    // 生成分享URL
    const generateShareUrl = (marker: Marker) => {
        if (!marker) return '';

        try {
            const markerData = {
                id: marker.id,
                title: marker.title,
                description: marker.description,
                latitude: marker.latitude,
                longitude: marker.longitude,
                altitude: marker.altitude,
                time_start: marker.time_start.toISOString(),
                time_end: marker.time_end?.toISOString(),
                type: marker.type,
                visibility: marker.visibility,
                createdBy: marker.createdBy
            };

            // 使用正确的UTF-8编码方法处理中文字符
            const jsonString = JSON.stringify(markerData);
            const encodedData = btoa(unescape(encodeURIComponent(jsonString)));
            const baseUrl = window.location.origin + window.location.pathname;
            return `${baseUrl}?shared=${encodedData}`;
        } catch (error) {
            console.error('生成分享URL失败:', error);
            return '';
        }
    };

    // 生成二维码URL（使用免费的二维码API）
    const generateQRCode = (url: string) => {
        const encodedUrl = encodeURIComponent(url);
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
    };

    // 导出标记数据为JSON文件
    const exportMarkerData = () => {
        if (!marker) return;

        const markerData = {
            id: marker.id,
            title: marker.title,
            description: marker.description,
            latitude: marker.latitude,
            longitude: marker.longitude,
            altitude: marker.altitude,
            time_start: marker.time_start.toISOString(),
            time_end: marker.time_end?.toISOString(),
            type: marker.type,
            visibility: marker.visibility,
            createdBy: marker.createdBy,
            exportedAt: new Date().toISOString(),
            exportedFrom: window.location.origin
        };

        const dataStr = JSON.stringify(markerData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `marker-${marker.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('标记数据已导出');
    };

    // 复制分享链接
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('链接已复制到剪贴板');

            // 记录分享历史到本地存储
            const shareHistory = JSON.parse(localStorage.getItem('markerShareHistory') || '[]');
            shareHistory.unshift({
                markerId: marker?.id,
                markerTitle: marker?.title,
                shareMethod: 'link',
                sharedAt: new Date().toISOString(),
                shareUrl: shareUrl
            });
            // 只保留最近20条记录
            localStorage.setItem('markerShareHistory', JSON.stringify(shareHistory.slice(0, 20)));

            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('复制失败，请手动复制链接');
        }
    };

    // 分享到社交平台
    const shareToSocial = (platform: string) => {
        const text = `查看这个标记: ${marker?.title || '未命名标记'}`;
        const url = shareUrl;

        let shareLink = '';
        switch (platform) {
            case 'wechat':
                // 微信分享需要通过二维码
                setSelectedMethod('qr');
                toast.info('请扫描二维码在微信中分享');
                break;
            case 'weibo':
                shareLink = `https://service.weibo.com/share/share.php?title=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'email':
                shareLink = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
                break;
            default:
                return;
        }

        if (shareLink) {
            window.open(shareLink, '_blank', 'width=550,height=350');
        }
    };

    // 当marker变化时更新分享URL
    useEffect(() => {
        if (marker && open) {
            const url = generateShareUrl(marker);
            setShareUrl(url);
            setQrCodeUrl(generateQRCode(url));
        }
    }, [marker, open]);

    if (!marker) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        分享 "{marker.title}"
                    </DialogTitle>
                    <DialogDescription>
                        选择分享方式
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-6 p-6">

                        {/* 分享方式选择 */}
                        <div className="space-y-3">
                            <Label>选择分享方式</Label>
                            <div className="grid gap-2">
                                {shareMethods.map((method) => (
                                    <div
                                        key={method.id}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                            selectedMethod === method.id 
                                                ? 'border-primary bg-primary/5' 
                                                : 'hover:bg-secondary/50'
                                        }`}
                                        onClick={() => setSelectedMethod(method.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {method.icon}
                                            <div>
                                                <p className="font-medium">{method.name}</p>
                                                <p className="text-sm text-muted-foreground">{method.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* 分享链接 */}
                        {selectedMethod === 'link' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>分享链接</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={shareUrl}
                                            readOnly
                                            className="flex-1 text-sm"
                                        />
                                        <Button onClick={handleCopyLink} variant="outline" size="icon">
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        链接包含完整的标记信息，无需服务器即可查看
                                    </p>
                                </div>

                                {/* 社交分享按钮 */}
                                <div className="space-y-2">
                                    <Label>快速分享到</Label>
                                    <div className="flex gap-2 flex-wrap">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => shareToSocial('wechat')}
                                        >
                                            微信
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => shareToSocial('weibo')}
                                        >
                                            微博
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => shareToSocial('email')}
                                        >
                                            邮件
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 二维码分享 */}
                        {selectedMethod === 'qr' && (
                            <div className="space-y-4">
                                <div className="text-center space-y-4">
                                    <Label>扫描二维码访问</Label>
                                    <div className="flex justify-center">
                                        <div className="p-4 border rounded-lg bg-white">
                                            <img
                                                src={qrCodeUrl}
                                                alt="QR Code"
                                                className="w-48 h-48"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZjlmOSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVycm9yPC90ZXh0Pjwvc3ZnPg==';
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        使用手机扫描二维码即可查看标记
                                    </p>
                                    <Button onClick={handleCopyLink} variant="outline" className="w-full">
                                        <Copy className="h-4 w-4 mr-2" />
                                        复制链接
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 导出数据 */}
                        {selectedMethod === 'export' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>导出标记数据</Label>
                                    <p className="text-sm text-muted-foreground">
                                        将标记数据导出为JSON文件，可以分享给他人或备份保存
                                    </p>
                                </div>

                                <div className="p-4 border rounded-lg bg-secondary/50">
                                    <h4 className="font-medium mb-2">导出内容包括:</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• 标记标题和描述</li>
                                        <li>• 位置坐标（经纬度、海拔）</li>
                                        <li>• 时间信息（开始和结束时间）</li>
                                        <li>• 标记类型和可见性设置</li>
                                        <li>• 创建者信息</li>
                                    </ul>
                                </div>

                                <Button onClick={exportMarkerData} className="w-full">
                                    <Download className="h-4 w-4 mr-2" />
                                    导出JSON文件
                                </Button>
                            </div>
                        )}

                        {/* 标记信息预览 */}
                        <Separator />
                        <div className="space-y-3">
                            <Label>标记信息预览</Label>
                            <div className="p-4 border rounded-lg bg-secondary/50 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">标题:</span>
                                    <span className="text-sm font-medium">{marker.title}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">位置:</span>
                                    <span className="text-sm">{marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">类型:</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {marker.type?.name || '未分类'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">可见性:</span>
                                    <Badge variant="outline" className="text-xs">
                                        {marker.visibility || 'public'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="flex-shrink-0" />

                <div className="flex items-center gap-2 p-6 pt-4 flex-shrink-0">
                    <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
                        关闭
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
