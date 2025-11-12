import {useState} from 'react';
import {Sheet, SheetContent, SheetTrigger} from './components/ui/sheet';
import {Button} from './components/ui/button';
import {Menu} from 'lucide-react';
import {MapView} from './components/MapView';
import {DrawerMenu} from './components/DrawerMenu';
import {TimelineControl} from './components/TimelineControl';
import {MarkerDetailsDialog} from './components/MarkerDetailsDialog';
import {SharingDialog} from './components/SharingDialog';
import {fetchMarkers, Marker} from './api/marker';
import {useQuery} from "@tanstack/react-query";



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


    const {
        data: markers = [],
        isLoading,
        error,
    } = useQuery<Marker[], Error>({
        queryKey: ['markers'],
        queryFn: fetchMarkers,
    });

    const handleMarkerClick = (marker: Marker) => {
        setSelectedMarker(marker);
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
        </div>
    );
}