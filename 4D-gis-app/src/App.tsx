import {useState} from 'react';
import {Sheet, SheetContent, SheetTrigger} from './components/ui/sheet';
import {Button} from './components/ui/button';
import {Menu} from 'lucide-react';
import {MapView} from './components/MapView';
import {DrawerMenu} from './components/DrawerMenu';
import {TimelineControl} from './components/TimelineControl';
import {MarkerDetailsDialog} from './components/MarkerDetailsDialog';
import {SharingDialog} from './components/SharingDialog';
import {createMarker, fetchMarkers, Marker, MarkerCreateRequest, Visibility} from './api/marker';
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {CreateMarkerDialog} from "./components/CreateMarkerDialog";


export default function App() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
    const [sharingDialogOpen, setSharingDialogOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date('2024-11-01T00:00:00'));
    const [timeGranularity, setTimeGranularity] = useState<'year' | 'month' | 'day' | 'hour'>('day');
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [showBasemap, setShowBasemap] = useState(true);
    const [showMarkers, setShowMarkers] = useState(true);
    const [createMarkerDialogOpen, setCreateMarkerDialogOpen] = useState(false);
    const [createMarkerPosition, setCreateMarkerPosition] = useState<[number, number, number?] | null>(null);

    const queryClient = useQueryClient();




    const {
        data: markers = []
    } = useQuery<Marker[], Error>({
        queryKey: ['markers'],
        queryFn: fetchMarkers,
    });

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

    const handleMarkerClick = (marker: Marker) => {
        setSelectedMarker(marker);
    };

    const handleOpenCreateMarker = (position: [number, number, number?]) => {
        setCreateMarkerPosition(position);
        setCreateMarkerDialogOpen(true);
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
        console.log('Edit marker:', selectedMarker);
    };

    const handleDelete = () => {
        console.log('Delete marker:', selectedMarker);
        setSelectedMarker(null);
    };

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
                            markers={markers}
                            onMarkerSelect={handleMarkerClick}
                            activeFilters={activeFilters}
                            onFiltersChange={setActiveFilters}
                            showBasemap={showBasemap}
                            onShowBasemapChange={setShowBasemap}
                            showMarkers={showMarkers}
                            onShowMarkersChange={setShowMarkers}
                        />
                    </SheetContent>
                </Sheet>
                <h1 className="flex-1 text-center">Map Application</h1>
                <div className="w-10"/>
                {/* Spacer for centering */}
            </div>

            {/* Main Map View */}
            <div className="flex-1 relative overflow-hidden">
                <MapView
                    markers={markers}
                    onMarkerClick={handleMarkerClick}
                    onCreateMarker={handleOpenCreateMarker}
                    currentTime={currentTime}
                    activeFilters={activeFilters}
                    showBasemap={showBasemap}
                    showMarkers={showMarkers}
                />
            </div>

            {/* Timeline Control */}
            <div className="border-t bg-card">
                <TimelineControl
                    currentTime={currentTime}
                    onTimeChange={setCurrentTime}
                    granularity={timeGranularity}
                    onGranularityChange={setTimeGranularity}
                    isPlaying={isPlaying}
                    onPlayingChange={setIsPlaying}
                    playbackSpeed={playbackSpeed}
                    onSpeedChange={setPlaybackSpeed}
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
                markerTitle={selectedMarker?.title || ''}
            />

            <CreateMarkerDialog
                open={createMarkerDialogOpen}
                onOpenChange={setCreateMarkerDialogOpen}
                onCreateMarker={handleCreateMarker}
                position={createMarkerPosition}
            />
        </div>
    );
}