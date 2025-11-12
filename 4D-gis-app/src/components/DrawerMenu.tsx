import {Tabs, TabsContent, TabsList, TabsTrigger} from './ui/tabs';
import {BarChart3, Eye, EyeOff, Layers, MapPin} from 'lucide-react';
import {Badge} from './ui/badge';
import {Checkbox} from './ui/checkbox';
import {Label} from './ui/label';
import {ScrollArea} from './ui/scroll-area';
import {Separator} from './ui/separator';
import type {Marker} from '../api/marker';

interface DrawerMenuProps {
    markers: Marker[];
    onMarkerSelect: (marker: Marker) => void;
    activeFilters: string[];
    onFiltersChange: (filters: string[]) => void;
}

export function DrawerMenu({markers, onMarkerSelect, activeFilters, onFiltersChange}: DrawerMenuProps) {
    const categories = Array.from(new Set(markers.map(m => m.type?.name || 'Uncategorized')));

    const toggleFilter = (category: string) => {
        if (activeFilters.includes(category)) {
            onFiltersChange(activeFilters.filter(f => f !== category));
        } else {
            onFiltersChange([...activeFilters, category]);
        }
    };

    const categoryStats = categories.map(cat => ({
        name: cat,
        count: markers.filter(m => (m.type?.name || 'Uncategorized') === cat).length,
    }));

    const getCategoryColor = (categoryName: string) => {
        const found = markers.find(m => (m.type?.name || 'Uncategorized') === categoryName && m.type?.color);
        return found?.type?.color ?? '#6b7280';
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b flex-shrink-0">
                <h2>Menu</h2>
            </div>

            <Tabs defaultValue="layers" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="flex w-full flex-shrink-0">
                    <TabsTrigger value="layers"
                                 className="text-xs flex-1 min-w-0 flex items-center justify-center gap-1">
                        <Layers className="h-4 w-4"/>
                        <span className="truncate">Layers</span>
                    </TabsTrigger>
                    <TabsTrigger value="markers"
                                 className="text-xs flex-1 min-w-0 flex items-center justify-center gap-1">
                        <MapPin className="h-4 w-4"/>
                        <span className="truncate">Markers</span>
                    </TabsTrigger>
                    <TabsTrigger value="stats"
                                 className="text-xs flex-1 min-w-0 flex items-center justify-center gap-1">
                        <BarChart3 className="h-4 w-4"/>
                        <span className="truncate">Stats</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="layers" className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="px-4 space-y-4">
                            <h3 className="mb-3">Layer Controls</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-4 w-4 text-muted-foreground"/>
                                        <Label>Base Map</Label>
                                    </div>
                                    <Checkbox defaultChecked/>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-4 w-4 text-muted-foreground"/>
                                        <Label>Markers</Label>
                                    </div>
                                    <Checkbox defaultChecked/>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-4 w-4 text-muted-foreground"/>
                                        <Label>Labels</Label>
                                    </div>
                                    <Checkbox defaultChecked/>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <EyeOff className="h-4 w-4 text-muted-foreground"/>
                                        <Label>Heatmap</Label>
                                    </div>
                                    <Checkbox/>
                                </div>
                            </div>

                            <Separator className="my-4"/>

                            <h3 className="mb-3">Category Filters</h3>

                            <div className="space-y-2">
                                {categories.map(category => (
                                    <div key={category}
                                         className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div style={{backgroundColor: getCategoryColor(category)}}
                                                 className="h-3 w-3 rounded-full"/>
                                            <Label>{category}</Label>
                                        </div>
                                        <Checkbox
                                            checked={activeFilters.length === 0 || activeFilters.includes(category)}
                                            onCheckedChange={() => toggleFilter(category)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="markers" className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="px-4 py-4 space-y-3">
                            <div className="flex items-center justify-between mb-3">
                                <h3>All Markers</h3>
                                <Badge variant="secondary">{markers.length}</Badge>
                            </div>

                            <div className="space-y-2">
                                {markers.map(marker => (
                                    <button
                                        key={marker.id}
                                        onClick={() => onMarkerSelect(marker)}
                                        className="w-full text-left p-3 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                style={{backgroundColor: marker.type?.color ?? '#6b7280'}}
                                                className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <MapPin className="h-4 w-4 text-white"/>
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <p className="font-medium truncate">{marker.title}</p>
                                                <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                                                    {marker.description}
                                                </p>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant="outline" className="text-xs">
                                                        {marker.type?.name || 'Uncategorized'}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {marker.time_start.toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="stats" className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="px-4 space-y-4">
                            <h3 className="mb-3">Statistics Overview</h3>
                            <div className="grid gap-3">
                                <div className="p-4 bg-secondary/50 rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">Total Markers</p>
                                    <p className="text-2xl">{markers.length}</p>
                                </div>

                                <div className="p-4 bg-secondary/50 rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">Categories</p>
                                    <p className="text-2xl">{categories.length}</p>
                                </div>

                                <Separator/>

                                <div>
                                    <p className="text-xs text-muted-foreground mb-3">By Category</p>
                                    <div className="space-y-2">
                                        {categoryStats.map(stat => (
                                            <div key={stat.name} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div style={{backgroundColor: getCategoryColor(stat.name)}}
                                                         className="h-3 w-3 rounded-full"/>
                                                    <span className="text-sm">{stat.name}</span>
                                                </div>
                                                <Badge variant="secondary">{stat.count}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator/>

                                <div>
                                    <p className="text-xs text-muted-foreground mb-3">Recent Activity</p>
                                    <div className="space-y-2">
                                        {markers.slice().sort((a, b) => b.time_start.getTime() - a.time_start.getTime()).map(marker => (
                                            <div key={marker.id} className="text-sm">
                                                <p className="truncate">{marker.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {marker.time_start.toLocaleDateString()} at {marker.time_start.toLocaleTimeString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
}