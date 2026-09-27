
"use client"

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { instructors, type Instructor, type PricingTier, type PricingCategory, type CarDetails } from '@/lib/data';
import { Edit, Mail, Phone, Save, PlusCircle, Trash2, Car, ArrowUp, ArrowDown, Bell, CalendarOff, Calendar, Moon, Tag, Sparkles, Clock, Layers, Star, Plus, Zap, Check, Camera, Upload, ImageIcon, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchParams } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { produce } from 'immer';
import { StripeConnectCard } from "@/components/StripeConnectCard";
import { DriveSwiftSubscriptionCard } from "@/components/DriveSwiftSubscriptionCard";


function EditProfileDialog({ 
    settings, 
    instructorName, 
    instructorEmail, 
    instructorPhone,
    instructorAvatarUrl,
    onSave, 
    onOpenChange 
}: { 
    settings: Instructor['settings'], 
    instructorName: string, 
    instructorEmail: string, 
    instructorPhone: string, 
    instructorAvatarUrl?: string,
    onSave: (newName: string, newEmail: string, newPhone: string, newAvatarUrl: string, newSettings: Instructor['settings']) => void, 
    onOpenChange: (open: boolean) => void 
}) {
    const [currentSettings, setCurrentSettings] = useState(settings);
    const [name, setName] = useState(instructorName);
    const [email, setEmail] = useState(instructorEmail);
    const [phone, setPhone] = useState(instructorPhone);
    const [avatarUrl, setAvatarUrl] = useState(instructorAvatarUrl || '');
    const [carImageUrl, setCarImageUrl] = useState(settings.carDetails.imageUrl || '');

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const carInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // When the dialog opens, reset state to latest values
        setCurrentSettings(settings);
        setName(instructorName);
        setEmail(instructorEmail);
        setPhone(instructorPhone);
        setAvatarUrl(instructorAvatarUrl || '');
        setCarImageUrl(settings.carDetails.imageUrl || '');
    }, [settings, instructorName, instructorEmail, instructorPhone, instructorAvatarUrl]);

    const handleInputChange = (section: keyof Instructor['settings'], field: string, value: any) => {
        if (section === 'carDetails' || section === 'rules' || section === 'holidayMode' || section === 'notifications') {
            setCurrentSettings(produce(draft => ({ ...draft, [section]: { ...draft[section], [field]: value }})));
        }
    }

    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (evt) => {
                if (evt.target?.result) {
                    setAvatarUrl(evt.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (evt) => {
                if (evt.target?.result) {
                    const resultUrl = evt.target.result as string;
                    setCarImageUrl(resultUrl);
                    handleInputChange('carDetails', 'imageUrl', resultUrl);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePriceChange = (id: string, key: keyof PricingTier, value: any) => {
        setCurrentSettings(produce(draft => ({
            ...draft,
            pricing: draft.pricing.map(tier =>
                tier.id === id ? { 
                    ...tier, 
                    [key]: key === 'price' ? (parseFloat(value as string) || 0) : value 
                } : tier
            )
        })));
    };

    const handleAddTier = (preset?: Partial<PricingTier>) => {
        const newTier: PricingTier = {
            id: `tier-${Date.now()}`,
            label: preset?.label || 'Custom Driving Package',
            price: preset?.price ?? 35,
            duration: preset?.duration || '1 Hour',
            category: preset?.category || 'Standard',
            description: preset?.description || '',
            isPopular: preset?.isPopular ?? false,
        };
        setCurrentSettings(produce(draft => ({ ...draft, pricing: [...draft.pricing, newTier] })));
    };

    const handleRemoveTier = (id: string) => {
        setCurrentSettings(produce(draft => ({ ...draft, pricing: draft.pricing.filter(tier => tier.id !== id) })));
    }

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newPricing = [...currentSettings.pricing];
        const item = newPricing[index];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (swapIndex < 0 || swapIndex >= newPricing.length) {
            return;
        }

        newPricing[index] = newPricing[swapIndex];
        newPricing[swapIndex] = item;

        setCurrentSettings(produce(draft => ({...draft, pricing: newPricing})));
    }

    const handleSave = () => {
        const updatedSettings = produce(currentSettings, draft => {
            draft.carDetails.imageUrl = carImageUrl || draft.carDetails.imageUrl;
        });
        onSave(name, email, phone, avatarUrl, updatedSettings);
        onOpenChange(false);
    }
    
    const handleCarImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCarImageFile(e.target.files[0]);
        }
    }

    return (
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle>Edit Instructor Profile</DialogTitle>
                <DialogDescription>
                    Update your details, pricing, and settings below. Click save when you're done.
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] my-4">
                <div className="grid gap-8 p-1 pr-6">
                    {/* Personal Details */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" /> Personal Details & Profile Photo
                        </h4>
                        
                        {/* Instructor Avatar Upload */}
                        <div className="flex items-center gap-6 p-4 rounded-xl border bg-muted/30">
                            <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-sm relative overflow-hidden">
                                <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                                <AvatarFallback className="text-lg font-bold">
                                    {name ? name.split(' ').map(n=>n[0]).join('') : 'DS'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <div>
                                    <h5 className="font-semibold text-sm">Instructor Avatar Photo</h5>
                                    <p className="text-xs text-muted-foreground">Upload a clear profile photo so students recognize you.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        ref={avatarInputRef} 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleAvatarFileChange} 
                                    />
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => avatarInputRef.current?.click()} 
                                        className="gap-1.5 text-xs"
                                    >
                                        <Camera className="h-3.5 w-3.5 text-primary" /> Upload Avatar Photo
                                    </Button>
                                    {avatarUrl && (
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => setAvatarUrl('')} 
                                            className="text-xs text-destructive hover:bg-destructive/10"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                         <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                             <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Car Details & Photo Upload */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                            <Car className="h-5 w-5 text-primary" /> Instruction Vehicle & Photo
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Make</Label>
                                        <Input value={currentSettings.carDetails.make} onChange={e => handleInputChange('carDetails', 'make', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Model</Label>
                                        <Input value={currentSettings.carDetails.model} onChange={e => handleInputChange('carDetails', 'model', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Transmission</Label>
                                        <Select onValueChange={(value: 'Manual' | 'Automatic') => handleInputChange('carDetails', 'transmission', value)} value={currentSettings.carDetails.transmission}>
                                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Manual">Manual</SelectItem>
                                                <SelectItem value="Automatic">Automatic</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Fuel Type</Label>
                                        <Input value={currentSettings.carDetails.fuelType} onChange={e => handleInputChange('carDetails', 'fuelType', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Colour</Label>
                                        <Input value={currentSettings.carDetails.colour} onChange={e => handleInputChange('carDetails', 'colour', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Registration</Label>
                                        <Input value={currentSettings.carDetails.registration} onChange={e => handleInputChange('carDetails', 'registration', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                             <div className="space-y-3">
                                <Label className="flex items-center gap-2 font-medium">
                                    <ImageIcon className="h-4 w-4 text-primary" /> Instruction Vehicle Photo
                                </Label>
                                <div className="relative aspect-video rounded-xl overflow-hidden border shadow-sm bg-muted/30">
                                    {carImageUrl ? (
                                        <Image
                                            src={carImageUrl}
                                            alt="Instruction car"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                                            <Car className="h-10 w-10 mb-2 opacity-50" />
                                            <p className="text-xs">No car photo uploaded yet</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        ref={carInputRef} 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleCarFileChange} 
                                    />
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => carInputRef.current?.click()} 
                                        className="gap-1.5 text-xs w-full sm:w-auto"
                                    >
                                        <Upload className="h-3.5 w-3.5 text-primary" /> Upload Vehicle Photo
                                    </Button>
                                    {carImageUrl && (
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => {
                                                setCarImageUrl('');
                                                handleInputChange('carDetails', 'imageUrl', '');
                                            }} 
                                            className="text-xs text-destructive hover:bg-destructive/10"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                <p className="text-[11px] text-muted-foreground">Students see this photo when booking lessons with you.</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Booking Rules */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Booking Rules</h4>
                        <div>
                            <Label>Minimum Lesson Duration</Label>
                            <div className="flex items-center gap-2">
                                <Input 
                                    type="number" 
                                    value={currentSettings.rules.minLessonDurationMinutes} 
                                    onChange={e => handleInputChange('rules', 'minLessonDurationMinutes', parseInt(e.target.value) || 0)} 
                                    className="w-24"
                                />
                                <span>minutes</span>
                            </div>
                        </div>
                    </div>

                    {/* App Settings */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">App Settings</h4>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className='space-y-4'>
                                <h5 className='font-medium'>Holiday Mode</h5>
                                <div className="flex items-center space-x-2">
                                    <Switch id="holiday-mode-enabled" checked={currentSettings.holidayMode.enabled} onCheckedChange={(checked) => handleInputChange('holidayMode', 'enabled', checked)} />
                                    <Label htmlFor="holiday-mode-enabled">Enable Holiday Mode</Label>
                                </div>
                                <div className='space-y-2'>
                                    <Label>Start Date</Label>
                                     <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !currentSettings.holidayMode.startDate && "text-muted-foreground")}>
                                                <Calendar className="mr-2 h-4 w-4"/>
                                                {currentSettings.holidayMode.startDate ? format(new Date(currentSettings.holidayMode.startDate), 'PPP') : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0"><CalendarPicker mode="single" selected={currentSettings.holidayMode.startDate ? new Date(currentSettings.holidayMode.startDate) : undefined} onSelect={(d) => handleInputChange('holidayMode', 'startDate', d?.toISOString())} /></PopoverContent>
                                    </Popover>
                                </div>
                                <div className='space-y-2'>
                                    <Label>End Date</Label>
                                     <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !currentSettings.holidayMode.endDate && "text-muted-foreground")}>
                                                <Calendar className="mr-2 h-4 w-4"/>
                                                {currentSettings.holidayMode.endDate ? format(new Date(currentSettings.holidayMode.endDate), 'PPP') : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0"><CalendarPicker mode="single" selected={currentSettings.holidayMode.endDate ? new Date(currentSettings.holidayMode.endDate) : undefined} onSelect={(d) => handleInputChange('holidayMode', 'endDate', d?.toISOString())} /></PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                             <div className='space-y-4'>
                                <h5 className='font-medium'>Notifications</h5>
                                 <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <Label htmlFor="email-notifications">Email Notifications</Label>
                                    <Switch id="email-notifications" checked={currentSettings.notifications.email} onCheckedChange={(checked) => handleInputChange('notifications', 'email', checked)} />
                                </div>
                                 <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <Label htmlFor="push-notifications">Push Notifications</Label>
                                    <Switch id="push-notifications" checked={currentSettings.notifications.push} onCheckedChange={(checked) => handleInputChange('notifications', 'push', checked)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Flexible Lesson Pricing & Packages */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2 flex-wrap gap-2">
                            <div>
                                <h4 className="font-semibold text-lg flex items-center gap-2">
                                    <Tag className="h-5 w-5 text-primary" /> Lesson Pricing & Custom Packages
                                </h4>
                                <p className="text-xs text-muted-foreground">Create custom rates for 1hr, 2hr, block bookings, intensive packages, pass plus, and test days.</p>
                            </div>
                        </div>

                        {/* Quick Preset Buttons */}
                        <div className="space-y-2 bg-muted/40 p-3 rounded-lg border">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Zap className="h-3.5 w-3.5 text-amber-500" /> Quick Add Templates
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => handleAddTier({ label: '1 Hour Standard Lesson', price: 38, duration: '1 Hour', category: 'Standard', description: 'Standard 1-to-1 driving lesson.' })}>
                                    <Plus className="h-3.5 w-3.5 mr-1" /> 1 Hour (£38)
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => handleAddTier({ label: '2 Hour Standard Lesson', price: 72, duration: '2 Hours', category: 'Standard', description: 'Recommended 2-hour intensive session.' })}>
                                    <Plus className="h-3.5 w-3.5 mr-1" /> 2 Hours (£72)
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => handleAddTier({ label: '10 Hour Block Booking', price: 340, duration: '10 Hours', category: 'Block Booking', description: 'Save money with upfront block booking.', isPopular: true })}>
                                    <Plus className="h-3.5 w-3.5 mr-1 text-primary" /> 10 Hr Block (£340) ⭐
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => handleAddTier({ label: 'Pass Plus Course', price: 230, duration: '6 Hours', category: 'Advanced Training', description: 'Motorway, night, and adverse weather training.' })}>
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Pass Plus (£230)
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => handleAddTier({ label: 'Practical Test Day Hire', price: 120, duration: '2.5 Hours', category: 'Test Day', description: 'Includes 1hr warmup and car hire for test.' })}>
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Test Day Hire (£120)
                                </Button>
                                <Button type="button" variant="secondary" size="sm" onClick={() => handleAddTier()}>
                                    <PlusCircle className="h-3.5 w-3.5 mr-1" /> Custom Package
                                </Button>
                            </div>
                        </div>

                        {/* Package Cards List */}
                        <div className="space-y-3 mt-4">
                            {currentSettings.pricing.map((tier, index) => (
                                <div key={tier.id} className={cn("p-4 border rounded-xl space-y-3 transition-all", tier.isPopular ? "border-primary/50 bg-primary/5 shadow-sm" : "bg-card")}>
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-0.5 border rounded-md p-0.5 bg-background">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleMove(index, 'up')} disabled={index === 0} className="h-7 w-7">
                                                    <ArrowUp className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleMove(index, 'down')} disabled={index === currentSettings.pricing.length - 1} className="h-7 w-7">
                                                    <ArrowDown className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                            <span className="text-xs font-mono font-medium text-muted-foreground">#{index + 1}</span>
                                            {tier.isPopular && (
                                                <Badge variant="default" className="text-[10px] gap-1 px-2 py-0.5">
                                                    <Star className="h-3 w-3 fill-current" /> Featured / Best Value
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center space-x-2 border rounded-lg px-2.5 py-1 bg-background">
                                                <Switch 
                                                    id={`popular-${tier.id}`} 
                                                    checked={!!tier.isPopular} 
                                                    onCheckedChange={(checked) => handlePriceChange(tier.id, 'isPopular', checked)} 
                                                />
                                                <Label htmlFor={`popular-${tier.id}`} className="text-xs cursor-pointer flex items-center gap-1">
                                                    <Star className="h-3 w-3 text-amber-500" /> Highlight as Popular
                                                </Label>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTier(tier.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                        <div className="md:col-span-5 space-y-1">
                                            <Label className="text-xs">Package Title / Name</Label>
                                            <Input 
                                                value={tier.label} 
                                                onChange={(e) => handlePriceChange(tier.id, 'label', e.target.value)} 
                                                placeholder="e.g. 10 Hour Block Booking" 
                                            />
                                        </div>
                                        <div className="md:col-span-3 space-y-1">
                                            <Label className="text-xs">Category</Label>
                                            <Select 
                                                value={tier.category || 'Standard'} 
                                                onValueChange={(val: PricingCategory) => handlePriceChange(tier.id, 'category', val)}
                                            >
                                                <SelectTrigger className="h-9"><SelectValue placeholder="Category" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Standard">Standard Lesson</SelectItem>
                                                    <SelectItem value="Block Booking">Block Booking</SelectItem>
                                                    <SelectItem value="Intensive Package">Intensive Package</SelectItem>
                                                    <SelectItem value="Advanced Training">Advanced Training</SelectItem>
                                                    <SelectItem value="Test Day">Test Day Package</SelectItem>
                                                    <SelectItem value="Custom">Custom</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <Label className="text-xs">Price (£)</Label>
                                            <Input 
                                                type="number" 
                                                value={tier.price} 
                                                onChange={(e) => handlePriceChange(tier.id, 'price', e.target.value)} 
                                                placeholder="35" 
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <Label className="text-xs">Duration</Label>
                                            <Input 
                                                value={tier.duration || ''} 
                                                onChange={(e) => handlePriceChange(tier.id, 'duration', e.target.value)} 
                                                placeholder="e.g. 2 Hours" 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Description / Package Perks (optional)</Label>
                                        <Input 
                                            value={tier.description || ''} 
                                            onChange={(e) => handlePriceChange(tier.id, 'description', e.target.value)} 
                                            placeholder="e.g. Save £30 compared to hourly rates. Includes mock test feedback." 
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </ScrollArea>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save Changes</Button>
            </DialogFooter>
        </DialogContent>
    );
}


export default function ProfilePage() {
    const searchParams = useSearchParams();
    const instructorId = searchParams.get('instructorId') || 'instructor-driveswift-alex';
    
    const [instructor, setInstructor] = useState<Instructor | undefined>(() => {
        return instructors.find(i => i.id === instructorId) || instructors.find(i => i.id === 'instructor-driveswift-alex') || instructors[0];
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const found = instructors.find(i => i.id === instructorId) || instructors.find(i => i.id === 'instructor-driveswift-alex') || instructors[0];
        setInstructor(found);
    }, [instructorId]);

    const handleSave = (newName: string, newEmail: string, newPhone: string, newAvatarUrl: string, newSettings: Instructor['settings']) => {
        setInstructor(prev => {
            if (!prev) return undefined;
            const updatedInstructor: Instructor = {
                ...prev,
                name: newName,
                email: newEmail,
                phone: newPhone,
                avatarUrl: newAvatarUrl,
                settings: newSettings
            };

            const index = instructors.findIndex(i => i.id === prev.id);
            if (index !== -1) {
                instructors[index] = updatedInstructor;
            }
            
            return updatedInstructor;
        });

        toast({
            title: "Profile Updated",
            description: "Your details, pricing, and photos have been saved successfully."
        });
    }

    if (!instructor) {
        return <div>Loading...</div>;
    }
    
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative group cursor-pointer" onClick={() => setIsDialogOpen(true)}>
                                <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-sm overflow-hidden">
                                    <AvatarImage src={instructor.avatarUrl} alt={instructor.name} className="object-cover" />
                                    <AvatarFallback className="text-xl font-bold">
                                        {instructor.name.split(' ').map(n=>n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Camera className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{instructor.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="font-semibold">{instructor.accountType}</Badge>
                                    <span>Instructor Profile</span>
                                </CardDescription>
                            </div>
                        </div>
                        <DialogTrigger asChild>
                             <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Profile
                            </Button>
                        </DialogTrigger>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{instructor.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{instructor.phone}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-1 space-y-6">
                       <Card>
                            <CardHeader>
                                <CardTitle>Booking Rules</CardTitle>
                                <CardDescription>Rules applied to pupil bookings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                               <div className="space-y-2">
                                    <Label>Minimum Lesson Duration</Label>
                                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md w-fit">{instructor.settings.rules.minLessonDurationMinutes} minutes</p>
                               </div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>App Settings</CardTitle>
                                <CardDescription>Manage notifications and availability.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><Moon className="h-4 w-4"/>Holiday Mode</Label>
                                    {instructor.settings.holidayMode.enabled ? (
                                        <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md w-full">
                                            <p className='font-semibold'>On Holiday</p>
                                            <p>{format(new Date(instructor.settings.holidayMode.startDate!), 'do MMM')} - {format(new Date(instructor.settings.holidayMode.endDate!), 'do MMM yyyy')}</p>
                                        </div>
                                    ): (
                                        <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md w-fit">Disabled</p>
                                    )}
                               </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2"><Bell className="h-4 w-4"/>Notifications</Label>
                                    <div className='flex flex-col gap-2'>
                                        <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md w-full flex justify-between">Email: <span className='font-semibold'>{instructor.settings.notifications.email ? "On" : "Off"}</span></p>
                                        <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md w-full flex justify-between">Push: <span className='font-semibold'>{instructor.settings.notifications.push ? "On" : "Off"}</span></p>
                                    </div>
                               </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Tag className="h-5 w-5 text-primary" /> Lesson Rates & Packages
                                    </CardTitle>
                                    <CardDescription>Hourly rates, block discounts, intensive courses & test day packages.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)} className="gap-1.5 text-xs">
                                    <Edit className="h-3.5 w-3.5" /> Edit Rates & Packages
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {instructor.settings.pricing.map((tier) => (
                                        <div 
                                            key={tier.id} 
                                            className={cn(
                                                "p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all relative overflow-hidden",
                                                tier.isPopular ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" : "bg-card hover:border-muted-foreground/30"
                                            )}
                                        >
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                                    <Badge 
                                                        variant={tier.category === 'Block Booking' ? 'default' : tier.category === 'Advanced Training' ? 'secondary' : 'outline'}
                                                        className="text-[10px] font-medium tracking-wide"
                                                    >
                                                        {tier.category || 'Standard'}
                                                    </Badge>
                                                    {tier.isPopular && (
                                                        <Badge variant="default" className="text-[10px] gap-1 px-2 bg-amber-500 hover:bg-amber-600 text-white border-none">
                                                            <Star className="h-3 w-3 fill-current" /> Best Value
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h5 className="font-semibold text-base leading-tight pt-1">{tier.label}</h5>
                                                {tier.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2">{tier.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-baseline justify-between border-t pt-2.5 mt-2">
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3.5 w-3.5 text-primary/70" />
                                                    <span>{tier.duration || 'Flexible'}</span>
                                                </div>
                                                <span className="text-xl font-bold text-primary">£{tier.price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="mt-6 space-y-6">
                            <DriveSwiftSubscriptionCard currentTier="school" status="active" />
                            <StripeConnectCard instructorId={instructor.id} email={instructor.email} />
                        </div>
                    </div>
                </div>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                        <div>
                            <CardTitle className="flex items-center gap-2"><Car className="h-5 w-5 text-primary" /> About Your Car</CardTitle>
                            <CardDescription>Details about your instruction vehicle.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)} className="gap-1.5 text-xs">
                            <Upload className="h-3.5 w-3.5" /> Upload / Change Photos
                        </Button>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6 items-start">
                        <div className="space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Make</Label>
                                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">{instructor.settings.carDetails.make}</p>
                                </div>
                                <div>
                                    <Label>Model</Label>
                                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">{instructor.settings.carDetails.model}</p>
                                </div>
                                 <div>
                                    <Label>Transmission</Label>
                                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">{instructor.settings.carDetails.transmission}</p>
                                </div>
                                <div>
                                    <Label>Fuel Type</Label>
                                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">{instructor.settings.carDetails.fuelType}</p>
                                </div>
                                <div>
                                    <Label>Colour</Label>
                                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">{instructor.settings.carDetails.colour}</p>
                                </div>
                                <div>
                                    <Label>Registration</Label>
                                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">{instructor.settings.carDetails.registration}</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative group aspect-video rounded-xl overflow-hidden border shadow-sm bg-muted/30">
                            <Image
                                src={instructor.settings.carDetails.imageUrl || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80"}
                                alt="Instruction car"
                                fill
                                className="object-cover"
                                unoptimized
                                data-ai-hint="car"
                            />
                        </div>
                    </CardContent>
                </Card>

                <EditProfileDialog
                    settings={instructor.settings}
                    instructorName={instructor.name}
                    instructorEmail={instructor.email}
                    instructorPhone={instructor.phone}
                    instructorAvatarUrl={instructor.avatarUrl}
                    onSave={handleSave}
                    onOpenChange={setIsDialogOpen}
                />
            </div>
        </Dialog>
    )
}
