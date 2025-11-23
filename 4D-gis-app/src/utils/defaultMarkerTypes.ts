// 预设的标记点类别 - 用于离线或API失败时的备用数据
import { MarkerType } from '../api/markerTypes';

export const DEFAULT_MARKER_TYPES: MarkerType[] = [
    {
        typeId: 'default-1',
        name: '景点',
        color: '#3B82F6', // 蓝色
        icon: '📍'
    },
    {
        typeId: 'default-2',
        name: '餐厅',
        color: '#EF4444', // 红色
        icon: '🍽️'
    },
    {
        typeId: 'default-3',
        name: '酒店',
        color: '#8B5CF6', // 紫色
        icon: '🏨'
    },
    {
        typeId: 'default-4',
        name: '交通',
        color: '#F59E0B', // 橙色
        icon: '🚗'
    },
    {
        typeId: 'default-5',
        name: '购物',
        color: '#10B981', // 绿色
        icon: '🛍️'
    },
    {
        typeId: 'default-6',
        name: '娱乐',
        color: '#EC4899', // 粉色
        icon: '🎮'
    },
    {
        typeId: 'default-7',
        name: '医疗',
        color: '#14B8A6', // 青色
        icon: '🏥'
    },
    {
        typeId: 'default-8',
        name: '教育',
        color: '#6366F1', // 靛蓝色
        icon: '🎓'
    },
    {
        typeId: 'default-9',
        name: '办公',
        color: '#64748B', // 灰蓝色
        icon: '🏢'
    },
    {
        typeId: 'default-10',
        name: '其他',
        color: '#78716C', // 灰色
        icon: '📌'
    }
];

