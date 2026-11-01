'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  Share2,
  Heart,
  Key,
  CheckCircle2,
  Check,
  Copy,
  Info,
  AlertCircle,
  Download,
  QrCode,
  UploadCloud,
  Camera,
  Image as ImageIcon,
  Gem,
  LayoutGrid,
  Calendar,
  Users,
  Eye,
  LogOut,
  Bell,
  Lock,
  Unlock,
  Play,
  MapPin,
  Sparkles,
  Palette,
  PartyPopper,
  Wine,
  Music,
  Sun,
  Star,
  Headphones,
  ShieldCheck,
  Edit3,
  Plus,
  Send,
  Video,
  Maximize2,
  Printer,
  Link as LinkIcon,
  Database,
  Sliders,
  LucideProps
} from 'lucide-react';

interface AppIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
  className?: string;
  title?: string;
}

export default function AppIcon({ name, className = '', size = 18, ...props }: AppIconProps) {
  const iconKey = name.trim().toLowerCase();

  switch (iconKey) {
    case 'chevron_left':
      return <ChevronLeft className={className} size={size} {...props} />;
    case 'chevron_right':
      return <ChevronRight className={className} size={size} {...props} />;
    case 'arrow_forward':
    case 'arrow_right':
      return <ArrowRight className={className} size={size} {...props} />;
    case 'close':
    case 'x':
      return <X className={className} size={size} {...props} />;
    case 'share':
      return <Share2 className={className} size={size} {...props} />;
    case 'favorite':
    case 'heart':
      return <Heart className={className} size={size} {...props} />;
    case 'key':
    case 'vpn_key':
      return <Key className={className} size={size} {...props} />;
    case 'check_circle':
    case 'verified':
      return <CheckCircle2 className={className} size={size} {...props} />;
    case 'check':
      return <Check className={className} size={size} {...props} />;
    case 'content_copy':
    case 'copy':
      return <Copy className={className} size={size} {...props} />;
    case 'info':
      return <Info className={className} size={size} {...props} />;
    case 'error':
      return <AlertCircle className={className} size={size} {...props} />;
    case 'download':
      return <Download className={className} size={size} {...props} />;
    case 'qr_code_scanner':
    case 'qr_code_2':
    case 'qr_code':
      return <QrCode className={className} size={size} {...props} />;
    case 'cloud_upload':
    case 'backup':
      return <UploadCloud className={className} size={size} {...props} />;
    case 'add_photo_alternate':
    case 'add_a_photo':
      return <Camera className={className} size={size} {...props} />;
    case 'image':
    case 'photo_library':
      return <ImageIcon className={className} size={size} {...props} />;
    case 'diamond':
      return <Gem className={className} size={size} {...props} />;
    case 'grid_view':
      return <LayoutGrid className={className} size={size} {...props} />;
    case 'event':
    case 'calendar_month':
    case 'calendar_today':
    case 'calendar_add_on':
      return <Calendar className={className} size={size} {...props} />;
    case 'group':
    case 'face':
      return <Users className={className} size={size} {...props} />;
    case 'visibility':
      return <Eye className={className} size={size} {...props} />;
    case 'logout':
      return <LogOut className={className} size={size} {...props} />;
    case 'notifications':
      return <Bell className={className} size={size} {...props} />;
    case 'lock':
      return <Lock className={className} size={size} {...props} />;
    case 'lock_open':
      return <Unlock className={className} size={size} {...props} />;
    case 'play_arrow':
    case 'play':
      return <Play className={className} size={size} {...props} />;
    case 'location_on':
    case 'near_me':
      return <MapPin className={className} size={size} {...props} />;
    case 'spa':
      return <Sparkles className={className} size={size} {...props} />;
    case 'palette':
      return <Palette className={className} size={size} {...props} />;
    case 'nightlife':
    case 'celebration':
      return <PartyPopper className={className} size={size} {...props} />;
    case 'wine_bar':
      return <Wine className={className} size={size} {...props} />;
    case 'music_note':
      return <Music className={className} size={size} {...props} />;
    case 'wb_sunny':
      return <Sun className={className} size={size} {...props} />;
    case 'stars':
    case 'star':
    case 'flare':
      return <Star className={className} size={size} {...props} />;
    case 'support_agent':
      return <Headphones className={className} size={size} {...props} />;
    case 'shield':
      return <ShieldCheck className={className} size={size} {...props} />;
    case 'edit_note':
      return <Edit3 className={className} size={size} {...props} />;
    case 'add':
    case 'add_circle':
      return <Plus className={className} size={size} {...props} />;
    case 'send':
      return <Send className={className} size={size} {...props} />;
    case 'videocam':
    case 'stream':
      return <Video className={className} size={size} {...props} />;
    case 'fullscreen':
      return <Maximize2 className={className} size={size} {...props} />;
    case 'print':
      return <Printer className={className} size={size} {...props} />;
    case 'link':
      return <LinkIcon className={className} size={size} {...props} />;
    case 'database':
      return <Database className={className} size={size} {...props} />;
    case 'architecture':
    case 'tune':
      return <Sliders className={className} size={size} {...props} />;
    default:
      // Fallback to Material Symbols ligature if not in predefined map
      return (
        <span className={`material-symbols-outlined inline-block align-middle ${className}`}>
          {name}
        </span>
      );
  }
}

