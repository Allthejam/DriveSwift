
"use client"

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { instructors, type Instructor, type PricingTier, type CarDetails } from '@/lib/data';
import { Edit, Mail, Phone, Save, PlusCircle, Trash2, Car, ArrowUp, ArrowDown, Bell, CalendarOff, Calendar, Moon } from 'lucide-react';
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
import { produce } from 'immer';
import { StripeConnectCard } from "@/components/StripeConnectCard";
import { DriveSwiftSubscriptionCard } from "@/components/DriveSwiftSubscriptionCard";


function EditProfileDialog({ settings, instructorName, instructorEmail, instructorPhone, onSave, onOpenChange }: { settings: Instructor['settings'], instructorName: string, instructorEmail: string, instructorPhone: string, onSave: (newName: string, newEmail: string, newPhone: string, newSettings: Instructor['settings']) => void, onOpenChange: (open: boolean) => void }) {
    const [currentSettings, setCurrentSettings] = useState(settings);
    const [name, setName] = useState(instructorName);
    const [email, setEmail] = useState(instructorEmail);
    const [phone, setPhone] = useState(instructorPhone);
    const [carImageFile, setCarImageFile] = useState<File | null>(null);

    useEffect(() => {
        // When the dialog opens, reset the state to the latest settings
        setCurrentSettings(settings);
        setName(instructorName);
        setEmail(instructorEmail);
        setPhone(instructorPhone);
        setCarImageFile(null);
    }, [settings, instructorName, instructorEmail, instructorPhone]);

    const handleInputChange = (section: keyof Instructor['settings'], field: string, value: any) => {
        if (section === 'carDetails' || section === 'rules' || section === 'holidayMode' || section === 'notifications') {
            setCurrentSettings(produce(draft => ({ ...draft, [section]: { ...draft[section], [field]: value }})));
        }
    }

    const handlePriceChange = (id: string, key: 'label' | 'price', value: string | number) => {
        setCurrentSettings(produce(draft => ({
            ...draft,
            pricing: draft.pricing.map(tier =>
                tier.id === id ? { ...tier, [key]: key === 'price' ? parseFloat(value as string) || 0 : value } : tier
            )
        })));
    };

    const handleAddTier = () => {
        setCurrentSettings(produce(draft => ({ ...draft, pricing: [...draft.pricing, { id: `tier-${Date.now()}`, label: '', price: 0 }] })));
    }

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
        onSave(name, email, phone, currentSettings);
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
                        <h4 className="font-semibold text-lg border-b pb-2">Personal Details</h4>
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

                    {/* Car Details */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Car Details</h4>
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
                             <div className="space-y-2">
                                <Label>Car Photo</Label>
                                <div className="relative aspect-video rounded-lg overflow-hidden border">
                                    <Image
                                        src="https://placehold.co/600x400/png?text=+"
                                        alt="Instruction car"
                                        fill
                                        className="object-cover"
                                        data-ai-hint="car"
                                    />
                                </div>
                                 <div>
                                    <Input id="car-image-upload" type="file" onChange={handleCarImageChange} className="mt-2" accept="image/*" />
                                    {carImageFile && <p className="text-xs text-muted-foreground mt-1">Selected: {carImageFile.name}</p>}
                                    <p className="text-xs text-muted-foreground mt-1">Image upload is not functional in this prototype.</p>
                                </div>
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

                    {/* Pricing */}
                    <div className="space-y-4">
                       <h4 className="font-semibold text-lg border-b pb-2">Lesson Pricing</h4>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Order</TableHead>
                                    <TableHead>Duration / Label</TableHead>
                                    <TableHead>Price (£)</TableHead>
                                    <TableHead className="w-[50px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentSettings.pricing.map((tier, index) => (
                                    <TableRow key={tier.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleMove(index, 'up')} disabled={index === 0} className="h-8 w-8">
                                                    <ArrowUp className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleMove(index, 'down')} disabled={index === currentSettings.pricing.length - 1} className="h-8 w-8">
                                                    <ArrowDown className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input value={tier.label} onChange={(e) => handlePriceChange(tier.id, 'label', e.target.value)} placeholder="e.g., Single Hour" />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" value={tier.price} onChange={(e) => handlePriceChange(tier.id, 'price', e.target.value)} className="w-28" placeholder="e.g., 35" />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveTier(tier.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="mt-4">
                            <Button variant="outline" size="sm" onClick={handleAddTier}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Tier
                            </Button>
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

    const handleSave = (newName: string, newEmail: string, newPhone: string, newSettings: Instructor['settings']) => {
        setInstructor(prev => {
            if (!prev) return undefined;
            const updatedInstructor = {
                ...prev,
                name: newName,
                email: newEmail,
                phone: newPhone,
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
            description: "Your settings have been saved successfully."
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
                            <Avatar className="h-16 w-16">
                                <AvatarFallback>{instructor.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{instructor.name}</CardTitle>
                                <CardDescription>Instructor Profile</CardDescription>
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
                            <CardHeader>
                                <CardTitle>Lesson Pricing</CardTitle>
                                <CardDescription>Manage your lesson and block booking rates.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Duration / Label</TableHead>
                                            <TableHead>Price (£)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {instructor.settings.pricing.map((tier) => (
                                            <TableRow key={tier.id}>
                                                <TableCell className="font-medium">{tier.label}</TableCell>
                                                <TableCell>{`£${tier.price.toFixed(2)}`}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="mt-6 space-y-6">
                            <DriveSwiftSubscriptionCard currentTier="school" status="active" />
                            <StripeConnectCard instructorId={instructor.id} email={instructor.email} />
                        </div>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <div>
                            <CardTitle className="flex items-center gap-2"><Car className="h-5 w-5" /> About Your Car</CardTitle>
                            <CardDescription>Details about your instruction vehicle.</CardDescription>
                        </div>
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
                        <div className="relative group aspect-video rounded-lg overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80"
                                alt="Instruction car"
                                fill
                                className="object-cover"
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
                    onSave={handleSave}
                    onOpenChange={setIsDialogOpen}
                />
            </div>
        </Dialog>
    )
}
