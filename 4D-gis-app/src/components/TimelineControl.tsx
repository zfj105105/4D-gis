import {useState} from 'react';
import {Button} from './ui/button';
import {Slider} from './ui/slider';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './ui/select';
import {Calendar, Filter, Pause, Play, SkipBack, SkipForward} from 'lucide-react';
import {Badge} from './ui/badge';
import {Popover, PopoverContent, PopoverTrigger} from './ui/popover';

interface TimelineControlProps {
    currentTime: Date;
    onTimeChange: (time: Date) => void;
    granularity: 'year' | 'month' | 'day' | 'hour';
    onGranularityChange: (granularity: 'year' | 'month' | 'day' | 'hour') => void;
    isPlaying: boolean;
    onPlayingChange: (playing: boolean) => void;
    playbackSpeed: number;
    onSpeedChange: (speed: number) => void;
}

export function TimelineControl({
                                    currentTime,
                                    onTimeChange,
                                    granularity,
                                    onGranularityChange,
                                    isPlaying,
                                    onPlayingChange,
                                    playbackSpeed,
                                    onSpeedChange,
                                }: TimelineControlProps) {
    const [timeRange, setTimeRange] = useState([0]);
    const minDate = new Date('2024-09-01');
    const maxDate = new Date('2024-11-30');

    const handleTimeSliderChange = (value: number[]) => {
        setTimeRange(value);
        const totalDays = Math.floor((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
        const selectedDay = Math.floor((value[0] / 100) * totalDays);
        const newDate = new Date(minDate.getTime() + selectedDay * 24 * 60 * 60 * 1000);
        onTimeChange(newDate);
    };

    const stepForward = () => {
        const increment = {
            hour: 1000 * 60 * 60,
            day: 1000 * 60 * 60 * 24,
            month: 1000 * 60 * 60 * 24 * 30,
            year: 1000 * 60 * 60 * 24 * 365,
        }[granularity];

        const newTime = new Date(currentTime.getTime() + increment);
        if (newTime <= maxDate) {
            onTimeChange(newTime);
        }
    };

    const stepBackward = () => {
        const decrement = {
            hour: 1000 * 60 * 60,
            day: 1000 * 60 * 60 * 24,
            month: 1000 * 60 * 60 * 24 * 30,
            year: 1000 * 60 * 60 * 24 * 365,
        }[granularity];

        const newTime = new Date(currentTime.getTime() - decrement);
        if (newTime >= minDate) {
            onTimeChange(newTime);
        }
    };

    const formatDate = (date: Date) => {
        switch (granularity) {
            case 'hour':
                return date.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            case 'day':
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            case 'month':
                return date.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                });
            case 'year':
                return date.getFullYear().toString();
            default:
                return date.toLocaleDateString();
        }
    };

    return (
        <div className="p-4 space-y-3">
            {/* Timeline slider */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground"/>
                        <span className="text-sm">{formatDate(currentTime)}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {granularity}
                    </Badge>
                </div>

                <Slider
                    value={timeRange}
                    onValueChange={handleTimeSliderChange}
                    max={100}
                    step={1}
                    className="w-full"
                />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(minDate)}</span>
                    <span>{formatDate(maxDate)}</span>
                </div>
            </div>

            {/* Playback controls */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 flex-1">
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9"
                        onClick={stepBackward}
                    >
                        <SkipBack className="h-4 w-4"/>
                    </Button>

                    <Button
                        size="icon"
                        variant="default"
                        className="h-9 w-9"
                        onClick={() => onPlayingChange(!isPlaying)}
                    >
                        {isPlaying ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}
                    </Button>

                    <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9"
                        onClick={stepForward}
                    >
                        <SkipForward className="h-4 w-4"/>
                    </Button>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="ml-2">
                                {playbackSpeed}x
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40" align="start">
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">Playback Speed</p>
                                {[0.5, 1, 2, 5, 10].map(speed => (
                                    <Button
                                        key={speed}
                                        variant={playbackSpeed === speed ? 'default' : 'ghost'}
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() => onSpeedChange(speed)}
                                    >
                                        {speed}x
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <Select value={granularity} onValueChange={(value: any) => onGranularityChange(value)}>
                    <SelectTrigger className="w-[110px] h-9">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="hour">Hour</SelectItem>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                    </SelectContent>
                </Select>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <Filter className="h-4 w-4"/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60" align="end">
                        <div className="space-y-3">
                            <h4 className="text-sm">Time Range Filter</h4>
                            <div className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    Last 7 days
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    Last 30 days
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    Last 3 months
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    Custom range...
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
