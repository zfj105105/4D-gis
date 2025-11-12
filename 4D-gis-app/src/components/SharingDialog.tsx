import {useState} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from './ui/dialog';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Label} from './ui/label';
import {RadioGroup, RadioGroupItem} from './ui/radio-group';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './ui/select';
import {Separator} from './ui/separator';
import {ScrollArea} from './ui/scroll-area';
import {Badge} from './ui/badge';
import {Check, Clock, Copy, Globe, Shield, User, Users} from 'lucide-react';
import {toast} from "sonner";

interface SharingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    markerTitle: string;
}

interface SharedUser {
    name: string;
    email: string;
    role: 'owner' | 'editor' | 'viewer';
    sharedAt: Date;
}

export function SharingDialog({open, onOpenChange, markerTitle}: SharingDialogProps) {
    const [shareTarget, setShareTarget] = useState<'individual' | 'team' | 'public'>('individual');
    const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('viewer');
    const [emailInput, setEmailInput] = useState('');
    const [copied, setCopied] = useState(false);

    const [sharedUsers] = useState<SharedUser[]>([
        {
            name: 'John Doe',
            email: 'john@example.com',
            role: 'owner',
            sharedAt: new Date('2024-10-01'),
        },
        {
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'editor',
            sharedAt: new Date('2024-10-15'),
        },
        {
            name: 'Bob Johnson',
            email: 'bob@example.com',
            role: 'viewer',
            sharedAt: new Date('2024-10-20'),
        },
    ]);

    const changeLog = [
        {action: 'Shared with Jane Smith', user: 'John Doe', date: new Date('2024-10-15T10:30:00')},
        {action: 'Changed permission to Editor', user: 'John Doe', date: new Date('2024-10-16T14:20:00')},
        {action: 'Shared with Bob Johnson', user: 'Jane Smith', date: new Date('2024-10-20T09:15:00')},
    ];

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`https://app.example.com/marker/${markerTitle}`);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        if (emailInput) {
            toast.success(`Invitation sent to ${emailInput}`);
            setEmailInput('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] p-0 gap-0">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle>Share "{markerTitle}"</DialogTitle>
                    <DialogDescription>
                        Share this marker with others and manage permissions
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6">
                    <div className="space-y-6 pb-6">
                        {/* Share Target Selection */}
                        <div className="space-y-3">
                            <Label>Share with</Label>
                            <RadioGroup value={shareTarget} onValueChange={(value: any) => setShareTarget(value)}>
                                <div
                                    className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                                    <RadioGroupItem value="individual" id="individual"/>
                                    <Label htmlFor="individual"
                                           className="flex-1 cursor-pointer flex items-center gap-2">
                                        <User className="h-4 w-4"/>
                                        Individual
                                    </Label>
                                </div>
                                <div
                                    className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                                    <RadioGroupItem value="team" id="team"/>
                                    <Label htmlFor="team" className="flex-1 cursor-pointer flex items-center gap-2">
                                        <Users className="h-4 w-4"/>
                                        Team
                                    </Label>
                                </div>
                                <div
                                    className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                                    <RadioGroupItem value="public" id="public"/>
                                    <Label htmlFor="public" className="flex-1 cursor-pointer flex items-center gap-2">
                                        <Globe className="h-4 w-4"/>
                                        Public (Anyone with link)
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Email Input for Individual/Team */}
                        {(shareTarget === 'individual' || shareTarget === 'team') && (
                            <>
                                <Separator/>
                                <div className="space-y-3">
                                    <Label htmlFor="email">
                                        {shareTarget === 'individual' ? 'Email address' : 'Team email'}
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter email address"
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Select value={selectedRole}
                                                onValueChange={(value: any) => setSelectedRole(value)}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="viewer">Viewer</SelectItem>
                                                <SelectItem value="editor">Editor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={handleShare} className="w-full">
                                        Send Invitation
                                    </Button>
                                </div>
                            </>
                        )}

                        {/* Public Link */}
                        {shareTarget === 'public' && (
                            <>
                                <Separator/>
                                <div className="space-y-3">
                                    <Label>Public Link</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={`https://app.example.com/marker/${markerTitle}`}
                                            readOnly
                                            className="flex-1"
                                        />
                                        <Button onClick={handleCopyLink} variant="outline" size="icon">
                                            {copied ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Permission Levels Info */}
                        <Separator/>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground"/>
                                <Label>Permission Levels</Label>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-start p-2 bg-secondary/50 rounded">
                                    <div>
                                        <p>Owner</p>
                                        <p className="text-xs text-muted-foreground">Full access and control</p>
                                    </div>
                                    <Badge variant="default" className="text-xs">Full</Badge>
                                </div>
                                <div className="flex justify-between items-start p-2 bg-secondary/50 rounded">
                                    <div>
                                        <p>Editor</p>
                                        <p className="text-xs text-muted-foreground">Can view and edit</p>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">Edit</Badge>
                                </div>
                                <div className="flex justify-between items-start p-2 bg-secondary/50 rounded">
                                    <div>
                                        <p>Viewer</p>
                                        <p className="text-xs text-muted-foreground">Can only view</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">View</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Shared Users List */}
                        <Separator/>
                        <div className="space-y-3">
                            <Label>People with access</Label>
                            <div className="space-y-2">
                                {sharedUsers.map((user, index) => (
                                    <div key={index}
                                         className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="text-sm">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                        <Badge variant={user.role === 'owner' ? 'default' : 'secondary'}
                                               className="text-xs">
                                            {user.role}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Change Log */}
                        <Separator/>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground"/>
                                <Label>Recent Changes</Label>
                            </div>
                            <div className="space-y-2">
                                {changeLog.map((log, index) => (
                                    <div key={index} className="text-sm p-3 bg-secondary/50 rounded-lg">
                                        <p>{log.action}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {log.user} • {log.date.toLocaleDateString()} at {log.date.toLocaleTimeString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <Separator/>

                <div className="flex items-center gap-2 p-6 pt-4">
                    <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={() => onOpenChange(false)} className="flex-1">
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
