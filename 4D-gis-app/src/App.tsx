import {useState, useEffect} from 'react';
import {Sheet, SheetContent, SheetTrigger} from './components/ui/sheet';
import {Button} from './components/ui/button';
import {Menu, Users} from 'lucide-react';
import {MapView} from './components/MapView';
import {DrawerMenu} from './components/DrawerMenu';
import {TimelineControl} from './components/TimelineControl';
import {MarkerDetailsDialog} from './components/MarkerDetailsDialog';
import {SharingDialog} from './components/SharingDialog';
import {SharedMarkerDialog} from './components/SharedMarkerDialog';
import {FriendsDialog} from './components/FriendsDialog';
import {
    createMarker,
    deleteMarker,
    fetchMarkers,
    Marker,
    MarkerCreateRequest,
    MarkerUpdateRequest, updateMarker,
    Visibility
} from './api/marker';
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {CreateMarkerDialog} from "./components/CreateMarkerDialog";
import {EditMarkerDialog} from "./components/EditMarkerDialog";
import {parseSharedMarkerFromUrl, hasSharedMarker, clearSharedMarkerFromUrl} from './utils/shareUtils';
import {AuthPage} from "./components/AuthPage";
import {authUtils} from "./api/auth";


export default function App() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
    const [sharingDialogOpen, setSharingDialogOpen] = useState(false);
    const [sharedMarker, setSharedMarker] = useState<Marker | null>(null);
    const [sharedMarkerDialogOpen, setSharedMarkerDialogOpen] = useState(false);
    const [friendsDialogOpen, setFriendsDialogOpen] = useState(false);
    // 改为时间范围状态
    const [timeRange, setTimeRange] = useState<[Date, Date]>([
        new Date('2020-09-01'),
        new Date('2024-09-01')
    ]);
    const [timeGranularity, setTimeGranularity] = useState<'year' | 'month' | 'day' | 'hour'>('day');
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [showBasemap, setShowBasemap] = useState(true);
    const [showMarkers, setShowMarkers] = useState(true);
    const [createMarkerDialogOpen, setCreateMarkerDialogOpen] = useState(false);
    const [createMarkerPosition, setCreateMarkerPosition] = useState<[number, number, number?] | null>(null);
    const [editMarkerDialogOpen, setEditMarkerDialogOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const queryClient = useQueryClient();

    // 检查初始认证状态
    useEffect(() => {
        const checkAuth = () => {
            const isAuth = authUtils.isAuthenticated();
            setIsAuthenticated(isAuth);
            setIsCheckingAuth(false);
        };

        checkAuth();
    }, []);

    // 处理登录成功
    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    // 处理登出
    const handleLogout = () => {
        authUtils.logout();
        setIsAuthenticated(false);
        queryClient.clear(); // 清除所有缓存数据
    };

    // 检查是否有分享的标记
    useEffect(() => {
        if (hasSharedMarker()) {
            const shared = parseSharedMarkerFromUrl();
            if (shared) {
                setSharedMarker(shared);
                setSharedMarkerDialogOpen(true);
            }
        }
    }, []);

    const {
        data: markers = []
    } = useQuery<Marker[], Error>({
        queryKey: ['markers'],
        queryFn: fetchMarkers,
    });

    // 创建一个包含分享标记的标记列表（用于显示）
    const allMarkersToDisplay = [...markers];
    if (sharedMarker && !markers.find(m => m.id === sharedMarker.id)) {
        allMarkersToDisplay.push(sharedMarker);
    }

    const createMarkerMutation = useMutation({
        mutationFn: createMarker,
        onSuccess: () => {
            // 创建成功后刷新markers列表
            queryClient.invalidateQueries({ queryKey: ['markers'] });
            setCreateMarkerDialogOpen(false);
        },
        onError: (error) => {
            console.error('创建标记失败:', error);
            alert('创建标记失败，请重试');
        }
    });

    const deleteMarkerMutation = useMutation({
        mutationFn: deleteMarker,
        onSuccess: () => {
            // 删除成功后刷新markers列表并关闭详情弹窗
            queryClient.invalidateQueries({ queryKey: ['markers'] });
            setSelectedMarker(null);
        },
        onError: (error) => {
            console.error('删除标记失败:', error);
            alert('删除标记失败，请重试');
        }
    });

    const updateMarkerMutation = useMutation({
        mutationFn: ({markerId, markerData}: {markerId: string, markerData: MarkerUpdateRequest}) =>
            updateMarker(markerId, markerData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['markers'] });
            setEditMarkerDialogOpen(false);
        },
        onError: (error) => {
            console.error('更新标记失败:', error);
            alert('更新标记失败，请重试');
        }
    });

    // 检查标记是否与时间范围重合的函数
    const isMarkerInTimeRange = (marker: Marker, timeRange: [Date, Date]): boolean => {
        const [rangeStart, rangeEnd] = timeRange;
        const markerStart = marker.time_start;
        const markerEnd = marker.time_end || marker.time_start;

        return markerStart <= rangeEnd && markerEnd >= rangeStart;
    };

    // 过滤在当前时间范围内的标记
    const markersInTimeRange = allMarkersToDisplay.filter(marker => isMarkerInTimeRange(marker, timeRange));

    const handleMarkerClick = (marker: Marker) => {
        setSelectedMarker(marker);
    };

    const handleOpenCreateMarker = (position: [number, number, number?]) => {
        setCreateMarkerPosition(position);
        setCreateMarkerDialogOpen(true);
    };

    const handleSpeedChange = (speed: number) => {
        setPlaybackSpeed(speed);
    };

    // 新增时间范围变化处理函数
    const handleTimeRangeChange = (range: [Date, Date]) => {
        setTimeRange(range);
    };

    const handleCreateMarker = (markerData: any) => {
        const createRequest: MarkerCreateRequest = {
            title: markerData.title,
            description: markerData.description,
            latitude: markerData.latitude,
            longitude: markerData.longitude,
            altitude: markerData.altitude || undefined,
            time_start: markerData.time_start,
            time_end: markerData.time_end,
            typeId: markerData.typeId,
            visibility: markerData.visibility
        };

        createMarkerMutation.mutate(createRequest);
    };

    const handleShare = () => {
        setSharingDialogOpen(true);
    };

    const handleEdit = () => {
        setEditMarkerDialogOpen(true);
    };

    const handleUpdateMarker = (markerId: string, markerData: MarkerUpdateRequest) => {
        updateMarkerMutation.mutate({markerId, markerData});
    };

    const handleDelete = () => {
        if (selectedMarker?.id) {
            if (confirm('确定要删除这个标记吗？此操作无法撤销。')) {
                deleteMarkerMutation.mutate(selectedMarker.id);
            }
        }
    };

    // 处理添加分享标记到个人标记
    const handleAddSharedMarkerToMap = (marker: Marker) => {
        // 这里可以调用创建标记的API来将分享的标记添加到用户的标记列表中
        const createRequest: MarkerCreateRequest = {
            title: `${marker.title} (分享)`,
            description: marker.description,
            latitude: marker.latitude,
            longitude: marker.longitude,
            altitude: marker.altitude,
            time_start: marker.time_start,
            time_end: marker.time_end,
            typeId: marker.type?.typeId || '',
            visibility: Visibility.Private
        };

        createMarkerMutation.mutate(createRequest);
        clearSharedMarkerFromUrl();
        setSharedMarker(null);
    };

    const handleSharedMarkerDialogClose = (open: boolean) => {
        setSharedMarkerDialogOpen(open);
        if (!open) {
            // 如果用户关闭了分享标记对话框，清除URL参数但保留标记显示
            clearSharedMarkerFromUrl();
        }
    };
    if (isCheckingAuth) {
        return <div className="flex items-center justify-center h-screen">加载中...</div>;
    }
    if (!isAuthenticated) {
        return <AuthPage onLogin={handleLogin} />;
    }
    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-card">
                <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5"/>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] sm:w-96 p-0 h-screen">
                        <DrawerMenu
                            markers={markersInTimeRange} // 只显示在时间范围内的标记
                            onMarkerSelect={handleMarkerClick}
                            activeFilters={activeFilters}
                            onFiltersChange={setActiveFilters}
                            showBasemap={showBasemap}
                            onShowBasemapChange={setShowBasemap}
                            showMarkers={showMarkers}
                            onShowMarkersChange={setShowMarkers}
                            onLogout={handleLogout}
                        />
                    </SheetContent>
                </Sheet>
                <h1 className="flex-1 text-center">Map Application</h1>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setFriendsDialogOpen(true)}
                    >
                        <Users className="h-5 w-5"/>
                    </Button>
                </div>
            </div>

            {/* Main Map View */}
            <div className="flex-1 relative overflow-hidden">
                <MapView
                    markers={markersInTimeRange} // 只显示在时间范围内的标记
                    onMarkerClick={handleMarkerClick}
                    onCreateMarker={handleOpenCreateMarker}
                    timeRange={timeRange} // 传递时间范围而不是单个时间
                    activeFilters={activeFilters}
                    showBasemap={showBasemap}
                    showMarkers={showMarkers}
                    totalMarkers={allMarkersToDisplay.length} // 传递包含分享标记的总数量
                />
            </div>

            {/* Timeline Control */}
            <div className="border-t bg-card">
                <TimelineControl
                    timeRange={timeRange} // 使用时间范围
                    onTimeRangeChange={handleTimeRangeChange} // 使用时间范围变化处理函数
                    granularity={timeGranularity}
                    onGranularityChange={setTimeGranularity}
                    isPlaying={isPlaying}
                    onPlayingChange={setIsPlaying}
                    playbackSpeed={playbackSpeed}
                    onSpeedChange={handleSpeedChange}
                    markers={allMarkersToDisplay}
                />
            </div>

            {/* Marker Details Dialog */}
            <MarkerDetailsDialog
                marker={selectedMarker}
                open={!!selectedMarker}
                onOpenChange={(open) => !open && setSelectedMarker(null)}
                onEdit={handleEdit}
                onShare={handleShare}
                onDelete={handleDelete}
            />

            {/* Sharing Dialog */}
            <SharingDialog
                open={sharingDialogOpen}
                onOpenChange={setSharingDialogOpen}
                marker={selectedMarker}
            />

            {/* Shared Marker Dialog */}
            <SharedMarkerDialog
                marker={sharedMarker}
                open={sharedMarkerDialogOpen}
                onOpenChange={handleSharedMarkerDialogClose}
                onAddToMap={handleAddSharedMarkerToMap}
            />

            <CreateMarkerDialog
                open={createMarkerDialogOpen}
                onOpenChange={setCreateMarkerDialogOpen}
                onCreateMarker={handleCreateMarker}
                position={createMarkerPosition}
            />

            <EditMarkerDialog
                marker={selectedMarker}
                open={editMarkerDialogOpen}
                onOpenChange={setEditMarkerDialogOpen}
                onUpdateMarker={handleUpdateMarker}
            />

            {/* Friends Dialog */}
            <FriendsDialog
                open={friendsDialogOpen}
                onOpenChange={setFriendsDialogOpen}
            />
        </div>
    );
}
