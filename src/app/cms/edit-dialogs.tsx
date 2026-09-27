
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Car, Shield, Bot, Calendar, Users, BarChart, Check, Edit, Save, Trash2, PlusCircle, AlertCircle, ChevronDown, Rocket, HelpCircle, Mail, Inbox, Facebook, Twitter, Instagram, Linkedin, Globe, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { landingPageFeatures as initialFeatures, landingPageTestimonials as initialTestimonials, type LandingPageFeature, type LandingPageTestimonial, faqCategories as initialFaqCategories, type FaqCategory } from '@/lib/data';
import { ComponentType, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { produce } from 'immer';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Autoplay from "embla-carousel-autoplay"
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploader } from '@/components/ImageUploader';
import { PwaInstallModal } from '@/components/PwaInstallModal';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';


const icons: { [key in LandingPageFeature['icon']]: ComponentType<any> } = {
  Bot,
  Calendar,
  Users,
  BarChart,
  Shield,
  Rocket,
  HelpCircle,
};

const socialIcons: { [key: string]: ComponentType<any> } = {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
};

type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';

export type SeoContent = {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonicalUrl: string;
};

type PricingTierContent = {
    id: string;
    name: string;
    price: string;
    priceSuffix: string;
    description: string;
    features: string[];
    buttonText: string;
    popular: boolean;
};

type GlobalFeatureContent = {
    id: string;
    text: string;
};

type ImageTextContent = {
    id: string;
    imageUrl: string;
    title: string;
    paragraphs: string[];
    buttonText: string;
    buttonLink: string;
    titleTag: Tag;
    layout: 'imageLeft' | 'imageRight';
};

type FooterSocialLink = {
    id: string;
    platform: 'Facebook' | 'Twitter' | 'Instagram' | 'Linkedin';
    url: string;
};

type FooterLink = {
    id: string;
    text: string;
    url: string;
};

type FooterLinkColumn = {
    id: string;
    title: string;
    links: FooterLink[];
};

type SectionContent = {
    seo: SeoContent;
    hero: { title: string; subtitle: string; socialProof: string; imageUrl: string; titleTag: Tag; subtitleTag: Tag, socialProofTag: Tag };
    features: { title: string; subtitle: string; headingTag: Tag; items: LandingPageFeature[]; };
    testimonials: { title: string; subtitle: string; headingTag: Tag; items: LandingPageTestimonial[]; autoplay: boolean; stopOnHover: boolean; autoplayDelay: number; };
    pricing: { title: string; subtitle: string; headingTag: Tag; tiers: PricingTierContent[]; globalFeatures: GlobalFeatureContent[]; };
    imageText: ImageTextContent[];
    faq: { title: string; subtitle: string; headingTag: Tag; categories: FaqCategory[] };
    footer: {
        copyright: string;
        newsletterTitle: string;
        newsletterDescription: string;
        newsletterPlaceholder: string;
        newsletterButton: string;
        columns: FooterLinkColumn[];
        socials: FooterSocialLink[];
    };
};

type SectionKeys = keyof SectionContent;

interface SectionEditDialogProps {
  section: SectionKeys;
  content: SectionContent[SectionKeys];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (section: SectionKeys, newContent: any) => void;
}

function SectionEditDialog({ section, content, isOpen, onOpenChange, onSave }: SectionEditDialogProps) {
    const [editedContent, setEditedContent] = useState(content);

    useEffect(() => {
        setEditedContent(content);
    }, [content, isOpen]);

    const handleFieldChange = (field: string, value: string | boolean | number) => {
        setEditedContent(produce(draft => {
            (draft as any)[field] = value;
        }));
    };

    const handleItemChange = (index: number, field: string, value: string) => {
        setEditedContent(produce(draft => {
            (draft as any).items[index][field] = value;
        }));
    };
    
    const handleRemoveItem = (collection: 'items' | 'tiers' | 'globalFeatures' | 'categories' | 'imageText' | 'columns' | 'links' | 'socials', index: number, parentIndex?: number) => {
        setEditedContent(produce(draft => {
            if (collection === 'imageText') {
                 (draft as any).splice(index, 1);
            } else if (collection === 'links' && parentIndex !== undefined) {
                 (draft as any).columns[parentIndex].links.splice(index, 1);
            }
             else {
                (draft as any)[collection].splice(index, 1);
            }
        }));
    };

     const handleAddItem = (collection: 'items' | 'tiers' | 'globalFeatures' | 'categories' | 'imageText' | 'columns' | 'links' | 'socials', parentIndex?: number) => {
        setEditedContent(produce(draft => {
            if (collection === 'items' && section === 'features') {
                (draft as any).items.push({ icon: 'Rocket', title: 'New Feature', description: 'Describe the new feature.' });
            } else if (collection === 'items' && section === 'testimonials') {
                (draft as any).items.push({ quote: 'A great new testimonial.', author: 'New Author', school: 'Author\'s School' });
            } else if (collection === 'globalFeatures' && section === 'pricing') {
                 (draft as any).globalFeatures.push({ id: `gf-${Date.now()}`, text: 'New global feature text' });
            } else if (collection === 'categories' && section === 'faq') {
                (draft as any).categories.push({ id: `cat-${Date.now()}`, title: "New Category", items: [{ question: "A new question?", answer: "A new answer."}] });
            } else if (collection === 'imageText' && section === 'imageText') {
                 (draft as any).push({
                    id: `it-${Date.now()}`,
                    imageUrl: "https://placehold.co/400x400.png",
                    title: "New Section Title",
                    paragraphs: ["This is a new paragraph for your section."],
                    buttonText: "Learn More",
                    buttonLink: "#",
                    titleTag: "h2",
                    layout: "imageLeft"
                });
            } else if (collection === 'columns' && section === 'footer') {
                (draft as any).columns.push({ id: `col-${Date.now()}`, title: "New Column", links: [{id: `link-${Date.now()}`, text: "New Link", url: "#"}] });
            } else if (collection === 'links' && section === 'footer' && parentIndex !== undefined) {
                (draft as any).columns[parentIndex].links.push({ id: `link-${Date.now()}`, text: "New Link", url: "#" });
            } else if (collection === 'socials' && section === 'footer') {
                (draft as any).socials.push({ id: `social-${Date.now()}`, platform: "Facebook", url: "https://facebook.com" });
            }
        }));
    };

    const handleTierChange = (index: number, field: keyof PricingTierContent, value: string | boolean) => {
         setEditedContent(produce(draft => {
            (draft as any).tiers[index][field] = value;
        }));
    }

    const handleTierFeatureChange = (tierIndex: number, featureIndex: number, value: string) => {
        setEditedContent(produce(draft => {
            (draft as any).tiers[tierIndex].features[featureIndex] = value;
        }));
    }

    const handleRemoveTierFeature = (tierIndex: number, featureIndex: number) => {
         setEditedContent(produce(draft => {
            (draft as any).tiers[tierIndex].features.splice(featureIndex, 1);
        }));
    }

    const handleAddTierFeature = (tierIndex: number) => {
        setEditedContent(produce(draft => {
            (draft as any).tiers[tierIndex].features.push('New Feature');
        }));
    }

     const handleGlobalFeatureChange = (index: number, value: string) => {
        setEditedContent(produce(draft => {
            (draft as any).globalFeatures[index].text = value;
        }));
    };

    const handleImageTextChange = (index: number, field: keyof Omit<ImageTextContent, 'paragraphs' | 'id'>, value: string) => {
        setEditedContent(produce(draft => {
            (draft as any)[index][field] = value;
        }));
    };

    const handleImageTextParagraphChange = (index: number, pIndex: number, value: string) => {
        setEditedContent(produce(draft => {
            (draft as ImageTextContent[])[index].paragraphs[pIndex] = value;
        }));
    };

    const handleAddImageTextParagraph = (index: number) => {
        setEditedContent(produce(draft => {
            (draft as ImageTextContent[])[index].paragraphs.push('New paragraph text.');
        }));
    };

    const handleRemoveImageTextParagraph = (index: number, pIndex: number) => {
        setEditedContent(produce(draft => {
            (draft as ImageTextContent[])[index].paragraphs.splice(pIndex, 1);
        }));
    };

    const handleFaqCategoryTitleChange = (catIndex: number, value: string) => {
        setEditedContent(produce(draft => {
            (draft as any).categories[catIndex].title = value;
        }));
    };

    const handleFaqItemChange = (catIndex: number, itemIndex: number, field: 'question' | 'answer', value: string) => {
        setEditedContent(produce(draft => {
            (draft as any).categories[catIndex].items[itemIndex][field] = value;
        }));
    };
    
    const handleAddFaqItem = (catIndex: number) => {
        setEditedContent(produce(draft => {
            (draft as any).categories[catIndex].items.push({ question: "New Question", answer: "New Answer" });
        }));
    };

    const handleRemoveFaqItem = (catIndex: number, itemIndex: number) => {
        setEditedContent(produce(draft => {
            (draft as any).categories[catIndex].items.splice(itemIndex, 1);
        }));
    };

    const handleFooterLinkChange = (colIndex: number, linkIndex: number, field: 'text' | 'url', value: string) => {
        setEditedContent(produce(draft => {
            (draft as any).columns[colIndex].links[linkIndex][field] = value;
        }));
    };
    
    const handleSocialLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
        setEditedContent(produce(draft => {
            (draft as any).socials[index][field] = value;
        }));
    };

    const handleSave = () => {
        onSave(section, editedContent);
        onOpenChange(false);
    };
    
    const renderContent = () => {
        switch(section) {
            case 'seo':
                const seoContent = (editedContent as SectionContent['seo']) || {
                    metaTitle: '',
                    metaDescription: '',
                    keywords: '',
                    ogTitle: '',
                    ogDescription: '',
                    ogImage: '',
                    canonicalUrl: '',
                };
                return (
                    <div className="space-y-6">
                        <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
                            <h4 className="font-semibold text-lg flex items-center gap-2">
                                <Globe className="h-5 w-5 text-primary" /> Search Engine Optimization (SEO)
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                Configure page titles, meta descriptions, and search engine keywords for Google, Bing, and other search engines.
                            </p>

                            <div className="space-y-2">
                                <Label>Meta Title (Browser Tab & Search Title)</Label>
                                <Input 
                                    value={seoContent.metaTitle} 
                                    onChange={e => handleFieldChange('metaTitle', e.target.value)} 
                                    placeholder="e.g. DriveSwift | AI Platform for Driving Instructors"
                                />
                                <span className="text-[11px] text-muted-foreground block">
                                    Recommended: 50–60 characters (Current: {seoContent.metaTitle?.length || 0} chars)
                                </span>
                            </div>

                            <div className="space-y-2">
                                <Label>Meta Description (Search Result Snippet)</Label>
                                <Textarea 
                                    value={seoContent.metaDescription} 
                                    onChange={e => handleFieldChange('metaDescription', e.target.value)} 
                                    rows={3}
                                    placeholder="Describe your site for Google search results..."
                                />
                                <span className="text-[11px] text-muted-foreground block">
                                    Recommended: 150–160 characters (Current: {seoContent.metaDescription?.length || 0} chars)
                                </span>
                            </div>

                            <div className="space-y-2">
                                <Label>Target Keywords (Comma-separated)</Label>
                                <Input 
                                    value={seoContent.keywords} 
                                    onChange={e => handleFieldChange('keywords', e.target.value)} 
                                    placeholder="driving instructor app, ADI software, driving school software, lesson planner"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Canonical URL</Label>
                                <Input 
                                    value={seoContent.canonicalUrl} 
                                    onChange={e => handleFieldChange('canonicalUrl', e.target.value)} 
                                    placeholder="https://driveswift.app"
                                />
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
                            <h4 className="font-semibold text-lg">Social Share Cards (Open Graph / Twitter)</h4>
                            <div className="space-y-2">
                                <Label>Social Share Title (OG Title)</Label>
                                <Input 
                                    value={seoContent.ogTitle} 
                                    onChange={e => handleFieldChange('ogTitle', e.target.value)} 
                                    placeholder="Title shown when link is shared on Facebook, WhatsApp, LinkedIn"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Social Share Description (OG Description)</Label>
                                <Textarea 
                                    value={seoContent.ogDescription} 
                                    onChange={e => handleFieldChange('ogDescription', e.target.value)} 
                                    rows={2}
                                />
                            </div>

                            <ImageUploader
                                label="Social Share Image (OG Image Banner - 1200x630 recommended)"
                                value={seoContent.ogImage}
                                onChange={(url) => handleFieldChange('ogImage', url)}
                                folder="cms/seo"
                                maxSizeMB={5}
                            />
                        </div>
                    </div>
                );
            case 'hero':
                const heroContent = editedContent as SectionContent['hero'];
                return (
                    <div className="space-y-6">
                        <div className="p-4 border rounded-lg grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-1 space-y-2">
                               <Label>Title Tag (SEO)</Label>
                               <HeadingTagSelect value={heroContent.titleTag} onChange={(val) => handleFieldChange('titleTag', val)} />
                            </div>
                            <div className="md:col-span-2"><Label>Title</Label><Textarea value={heroContent.title} onChange={e => handleFieldChange('title', e.target.value)} rows={3} /></div>
                        </div>
                         <div className="p-4 border rounded-lg grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-1 space-y-2">
                               <Label>Subtitle Tag (SEO)</Label>
                               <HeadingTagSelect value={heroContent.subtitleTag} onChange={(val) => handleFieldChange('subtitleTag', val)} />
                            </div>
                            <div className="md:col-span-2"><Label>Subtitle</Label><Textarea value={heroContent.subtitle} onChange={e => handleFieldChange('subtitle', e.target.value)} rows={4} /></div>
                        </div>
                         <div className="p-4 border rounded-lg grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-1 space-y-2">
                                <Label>Social Proof Tag (SEO)</Label>
                                <HeadingTagSelect value={heroContent.socialProofTag} onChange={(val) => handleFieldChange('socialProofTag', val)} />
                            </div>
                            <div className="md:col-span-2"><Label>Social Proof Text</Label><Textarea value={heroContent.socialProof} onChange={e => handleFieldChange('socialProof', e.target.value)} /></div>
                        </div>
                        <ImageUploader
                            label="Hero Image"
                            value={heroContent.imageUrl}
                            onChange={(url) => handleFieldChange('imageUrl', url)}
                            folder="cms/hero"
                            maxSizeMB={5}
                        />
                    </div>
                );
            case 'features':
                 const featuresContent = editedContent as SectionContent['features'];
                 return (
                    <div className="space-y-6">
                        <div className="space-y-4 p-4 border rounded-lg">
                           <div className="flex justify-between items-center">
                             <h4 className="font-semibold text-lg">Section Header</h4>
                             <Button size="sm" variant="outline" onClick={() => handleAddItem('items')}><PlusCircle className="mr-2"/> Add Feature</Button>
                           </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <Label>Heading Tag (SEO)</Label>
                                    <HeadingTagSelect value={featuresContent.headingTag} onChange={(val) => handleFieldChange('headingTag', val)} />
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    <div><Label>Title</Label><Input value={featuresContent.title} onChange={e => handleFieldChange('title', e.target.value)} /></div>
                                    <div><Label>Subtitle</Label><Textarea value={featuresContent.subtitle} onChange={e => handleFieldChange('subtitle', e.target.value)} /></div>
                                </div>
                            </div>
                        </div>
                        <h4 className="font-semibold text-lg">Feature Items</h4>
                        {featuresContent.items.map((item: LandingPageFeature, index: number) => (
                             <div key={index} className="space-y-3 p-4 border rounded-lg relative">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleRemoveItem('items', index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                <div><Label>Icon</Label><Select value={item.icon} onValueChange={val => handleItemChange(index, 'icon', val)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{Object.keys(icons).map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Title</Label><Input value={item.title} onChange={e => handleItemChange(index, 'title', e.target.value)} /></div>
                                <div><Label>Description</Label><Textarea value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} /></div>
                            </div>
                        ))}
                    </div>
                );
            case 'testimonials':
                 const testimonialsContent = editedContent as SectionContent['testimonials'];
                 return (
                    <div className="space-y-6">
                        <div className="space-y-4 p-4 border rounded-lg">
                             <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-lg">Section Header</h4>
                                <Button size="sm" variant="outline" onClick={() => handleAddItem('items')}><PlusCircle className="mr-2"/> Add Testimonial</Button>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <Label>Heading Tag (SEO)</Label>
                                    <HeadingTagSelect value={testimonialsContent.headingTag} onChange={(val) => handleFieldChange('headingTag', val)} />
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    <div><Label>Title</Label><Input value={testimonialsContent.title} onChange={e => handleFieldChange('title', e.target.value)} /></div>
                                    <div><Label>Subtitle</Label><Textarea value={testimonialsContent.subtitle} onChange={e => handleFieldChange('subtitle', e.target.value)} /></div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 border rounded-lg">
                             <h4 className="font-semibold text-lg">Carousel Settings</h4>
                             <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch id="autoplay" checked={testimonialsContent.autoplay} onCheckedChange={(checked) => handleFieldChange('autoplay', checked)} />
                                        <Label htmlFor="autoplay">Autoplay Carousel</Label>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <Switch id="stopOnHover" checked={testimonialsContent.stopOnHover} onCheckedChange={(checked) => handleFieldChange('stopOnHover', checked)} disabled={!testimonialsContent.autoplay} />
                                        <Label htmlFor="stopOnHover" className={cn(testimonialsContent.autoplay ? '' : 'text-muted-foreground')}>Stop on hover</Label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="autoplayDelay">Autoplay Delay (ms)</Label>
                                    <Input
                                        id="autoplayDelay"
                                        type="number"
                                        value={testimonialsContent.autoplayDelay}
                                        onChange={e => handleFieldChange('autoplayDelay', parseInt(e.target.value, 10) || 4000)}
                                        disabled={!testimonialsContent.autoplay}
                                    />
                                </div>
                             </div>
                        </div>

                        <h4 className="font-semibold text-lg">Testimonial Items</h4>
                        {testimonialsContent.items.map((item: LandingPageTestimonial, index: number) => (
                             <div key={index} className="space-y-3 p-4 border rounded-lg relative">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleRemoveItem('items', index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                <div><Label>Quote</Label><Textarea value={item.quote} onChange={e => handleItemChange(index, 'quote', e.target.value)} /></div>
                                <div><Label>Author</Label><Input value={item.author} onChange={e => handleItemChange(index, 'author', e.target.value)} /></div>
                                <div><Label>School</Label><Input value={item.school} onChange={e => handleItemChange(index, 'school', e.target.value)} /></div>
                            </div>
                        ))}
                    </div>
                );
            case 'pricing':
                const pricingContent = editedContent as SectionContent['pricing'];
                return (
                     <div className="space-y-6">
                        <div className="space-y-4 p-4 border rounded-lg">
                            <h4 className="font-semibold text-lg">Section Header</h4>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <Label>Heading Tag (SEO)</Label>
                                    <HeadingTagSelect value={pricingContent.headingTag} onChange={(val) => handleFieldChange('headingTag', val)} />
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    <div><Label>Title</Label><Input value={pricingContent.title} onChange={e => handleFieldChange('title', e.target.value)} /></div>
                                    <div><Label>Subtitle</Label><Textarea value={pricingContent.subtitle} onChange={e => handleFieldChange('subtitle', e.target.value)} /></div>
                                </div>
                            </div>
                        </div>
                        
                        <h4 className="font-semibold text-lg">Pricing Tiers</h4>
                        {pricingContent.tiers.map((tier, index) => (
                            <div key={tier.id} className="space-y-4 p-4 border rounded-lg">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold">Tier: {tier.name}</Label>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`popular-${tier.id}`}>Popular</Label>
                                        <Switch id={`popular-${tier.id}`} checked={tier.popular} onCheckedChange={(checked) => handleTierChange(index, 'popular', checked)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>Name</Label><Input value={tier.name} onChange={e => handleTierChange(index, 'name', e.target.value)} /></div>
                                    <div><Label>Price</Label><Input value={tier.price} onChange={e => handleTierChange(index, 'price', e.target.value)} /></div>
                                    <div><Label>Price Suffix</Label><Input value={tier.priceSuffix} onChange={e => handleTierChange(index, 'priceSuffix', e.target.value)} placeholder="e.g. / month" /></div>
                                    <div><Label>Button Text</Label><Input value={tier.buttonText} onChange={e => handleTierChange(index, 'buttonText', e.target.value)} /></div>
                                </div>
                                <div><Label>Description</Label><Textarea value={tier.description} onChange={e => handleTierChange(index, 'description', e.target.value)} /></div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <Label>Features</Label>
                                        <Button size="sm" variant="ghost" onClick={() => handleAddTierFeature(index)}><PlusCircle className="mr-2 h-4 w-4" /> Add Feature</Button>
                                    </div>
                                    <div className="space-y-2">
                                        {tier.features.map((feature, fIndex) => (
                                            <div key={fIndex} className="flex items-center gap-2">
                                                <Input value={feature} onChange={e => handleTierFeatureChange(index, fIndex, e.target.value)} />
                                                <Button size="icon" variant="ghost" onClick={() => handleRemoveTierFeature(index, fIndex)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="space-y-4 p-4 border rounded-lg">
                           <div className="flex justify-between items-center">
                             <h4 className="font-semibold text-lg">Global Features (Checkmarks)</h4>
                             <Button size="sm" variant="outline" onClick={() => handleAddItem('globalFeatures')}><PlusCircle className="mr-2"/> Add Feature</Button>
                           </div>
                           <div className="space-y-2">
                            {pricingContent.globalFeatures.map((feature, index) => (
                                <div key={feature.id} className="flex items-center gap-2">
                                    <Input value={feature.text} onChange={e => handleGlobalFeatureChange(index, e.target.value)} />
                                    <Button size="icon" variant="ghost" onClick={() => handleRemoveItem('globalFeatures', index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            ))}
                           </div>
                        </div>

                    </div>
                );
            case 'imageText':
                const imageTextContent = editedContent as SectionContent['imageText'];
                return (
                    <div className="space-y-6">
                        {imageTextContent.map((item, index) => (
                            <div key={item.id} className="p-4 border rounded-lg space-y-6 relative">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-lg">Image & Text Block {index + 1}</h4>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('imageText', index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </div>
                                 <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Layout</Label>
                                        <Select value={item.layout} onValueChange={(value: 'imageLeft' | 'imageRight') => handleImageTextChange(index, 'layout', value)}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="imageLeft">Image Left, Text Right</SelectItem>
                                                <SelectItem value="imageRight">Image Right, Text Left</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Title Tag (SEO)</Label>
                                        <HeadingTagSelect value={item.titleTag} onChange={(val) => handleImageTextChange(index, 'titleTag', val)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Textarea value={item.title} onChange={e => handleImageTextChange(index, 'title', e.target.value)} rows={2} />
                                </div>
                                 <div className="space-y-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <Label>Paragraphs</Label>
                                        <Button size="sm" variant="ghost" onClick={() => handleAddImageTextParagraph(index)}><PlusCircle className="mr-2 h-4 w-4" /> Add Paragraph</Button>
                                    </div>
                                    <div className="space-y-2">
                                        {item.paragraphs.map((p, pIndex) => (
                                             <div key={pIndex} className="flex items-center gap-2">
                                                <Textarea value={p} onChange={e => handleImageTextParagraphChange(index, pIndex, e.target.value)} rows={3}/>
                                                <Button size="icon" variant="ghost" onClick={() => handleRemoveImageTextParagraph(index, pIndex)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                            <Label>Button Text</Label>
                                            <Input value={item.buttonText} onChange={e => handleImageTextChange(index, 'buttonText', e.target.value)} />
                                    </div>
                                        <div>
                                            <Label>Button Link URL</Label>
                                            <Input value={item.buttonLink} onChange={e => handleImageTextChange(index, 'buttonLink', e.target.value)} />
                                    </div>
                                </div>
                                 <ImageUploader
                                     label="Block Image"
                                     value={item.imageUrl}
                                     onChange={(url) => handleImageTextChange(index, 'imageUrl', url)}
                                     folder="cms/features"
                                     maxSizeMB={5}
                                 />
                            </div>
                        ))}
                        <div className="pt-6 border-t">
                            <Button variant="outline" onClick={() => handleAddItem('imageText')}><PlusCircle className="mr-2 h-4 w-4" /> Add Image & Text Block</Button>
                        </div>
                    </div>
                );
            case 'faq':
                const faqContent = editedContent as SectionContent['faq'];
                return (
                    <div className="space-y-6">
                         <div className="space-y-4 p-4 border rounded-lg">
                           <div className="flex justify-between items-center">
                             <h4 className="font-semibold text-lg">Section Header</h4>
                             <Button size="sm" variant="outline" onClick={() => handleAddItem('categories')}><PlusCircle className="mr-2"/> Add Category</Button>
                           </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <Label>Heading Tag (SEO)</Label>
                                    <HeadingTagSelect value={faqContent.headingTag} onChange={(val) => handleFieldChange('headingTag', val)} />
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    <div><Label>Title</Label><Input value={faqContent.title} onChange={e => handleFieldChange('title', e.target.value)} /></div>
                                    <div><Label>Subtitle</Label><Textarea value={faqContent.subtitle} onChange={e => handleFieldChange('subtitle', e.target.value)} /></div>
                                </div>
                            </div>
                        </div>

                        {faqContent.categories.map((category, catIndex) => (
                             <div key={category.id} className="p-4 border rounded-lg">
                                 <div className="flex justify-between items-center mb-4">
                                    <div className="flex-grow">
                                        <Label>Category Title</Label>
                                        <Input value={category.title} onChange={e => handleFaqCategoryTitleChange(catIndex, e.target.value)} className="text-lg font-semibold"/>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('categories', catIndex)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                 </div>

                                {category.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="p-3 border rounded-md mb-2 bg-muted/30">
                                         <div className="flex justify-between items-center mb-2">
                                            <Label>Question {itemIndex + 1}</Label>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveFaqItem(catIndex, itemIndex)} className="h-7 w-7"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                         </div>
                                         <Textarea value={item.question} onChange={e => handleFaqItemChange(catIndex, itemIndex, 'question', e.target.value)} className="mb-2"/>
                                         <Label>Answer</Label>
                                         <Textarea value={item.answer} onChange={e => handleFaqItemChange(catIndex, itemIndex, 'answer', e.target.value)} rows={4} />
                                    </div>
                                ))}
                                <Button size="sm" variant="outline" className="mt-4" onClick={() => handleAddFaqItem(catIndex)}><PlusCircle className="mr-2"/>Add Question</Button>
                            </div>
                        ))}
                    </div>
                );
            case 'footer':
                const footerContent = editedContent as SectionContent['footer'];
                return (
                    <div className="space-y-8">
                         <div className="space-y-4 p-4 border rounded-lg">
                           <h4 className="font-semibold text-lg">Newsletter</h4>
                           <div><Label>Title</Label><Input value={footerContent.newsletterTitle} onChange={e => handleFieldChange('newsletterTitle', e.target.value)} /></div>
                           <div><Label>Description</Label><Input value={footerContent.newsletterDescription} onChange={e => handleFieldChange('newsletterDescription', e.target.value)} /></div>
                           <div><Label>Input Placeholder</Label><Input value={footerContent.newsletterPlaceholder} onChange={e => handleFieldChange('newsletterPlaceholder', e.target.value)} /></div>
                           <div><Label>Button Text</Label><Input value={footerContent.newsletterButton} onChange={e => handleFieldChange('newsletterButton', e.target.value)} /></div>
                        </div>

                        <div className="space-y-4 p-4 border rounded-lg">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-lg">Link Columns</h4>
                                <Button size="sm" variant="outline" onClick={() => handleAddItem('columns')}><PlusCircle className="mr-2 h-4 w-4"/>Add Column</Button>
                            </div>
                            {footerContent.columns.map((column, colIndex) => (
                                <div key={column.id} className="p-4 border rounded-md bg-muted/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex-grow pr-4">
                                            <Label>Column Title</Label>
                                            <Input value={column.title} onChange={e => handleFieldChange(`columns[${colIndex}].title`, e.target.value)} className="font-semibold" />
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('columns', colIndex)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                    <div className="space-y-2">
                                        {column.links.map((link, linkIndex) => (
                                            <div key={link.id} className="grid grid-cols-2 gap-2 items-center">
                                                <Input value={link.text} onChange={e => handleFooterLinkChange(colIndex, linkIndex, 'text', e.target.value)} placeholder="Link Text" />
                                                <div className="flex items-center gap-2">
                                                    <Input value={link.url} onChange={e => handleFooterLinkChange(colIndex, linkIndex, 'url', e.target.value)} placeholder="URL (e.g., /about)" />
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('links', linkIndex, colIndex)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button size="sm" variant="outline" className="mt-3" onClick={() => handleAddItem('links', colIndex)}><PlusCircle className="mr-2 h-4 w-4"/>Add Link</Button>
                                </div>
                            ))}
                        </div>

                         <div className="space-y-4 p-4 border rounded-lg">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-lg">Social Media Links</h4>
                                <Button size="sm" variant="outline" onClick={() => handleAddItem('socials')}><PlusCircle className="mr-2 h-4 w-4"/>Add Social</Button>
                            </div>
                            {footerContent.socials.map((social, index) => (
                                <div key={social.id} className="grid grid-cols-3 gap-2 items-center">
                                    <Select value={social.platform} onValueChange={(value: 'Facebook' | 'Twitter' | 'Instagram' | 'Linkedin') => handleSocialLinkChange(index, 'platform', value)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(socialIcons).map(platform => (
                                                <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="col-span-2 flex items-center gap-2">
                                        <Input value={social.url} onChange={e => handleSocialLinkChange(index, 'url', e.target.value)} placeholder="Full URL (e.g., https://...)" />
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('socials', index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                         <div className="space-y-4 p-4 border rounded-lg">
                            <h4 className="font-semibold text-lg">Copyright</h4>
                            <div>
                                <Label>Copyright Text</Label>
                                <Input value={footerContent.copyright} onChange={e => handleFieldChange('copyright', e.target.value)} />
                            </div>
                        </div>
                    </div>
                )
            default: return null;
        }
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Edit {section.charAt(0).toUpperCase() + section.slice(1)} Section</DialogTitle>
                    <DialogDescription>
                        Update the content for this section. Your changes will be reflected on the page instantly.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] my-4 -mr-3 pr-3">
                   <div className="p-1 pr-3">
                     {renderContent()}
                   </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function HeadingTagSelect({ value, onChange }: { value: string, onChange: (value: string) => void }) {
    return (
        <div>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="h1">H1 (Most Important)</SelectItem>
                    <SelectItem value="h2">H2</SelectItem>
                    <SelectItem value="h3">H3</SelectItem>
                    <SelectItem value="h4">H4</SelectItem>
                    <SelectItem value="h5">H5</SelectItem>
                    <SelectItem value="h6">H6 (Least Important)</SelectItem>
                    <SelectItem value="p">P (Paragraph)</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}


export default function CmsPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isPricingExpanded, setIsPricingExpanded] = useState(false);
  
  const [content, setContent] = useState<SectionContent>({
    seo: {
        metaTitle: "DriveSwift | AI-Powered Platform for Driving Instructors & Driving Schools",
        metaDescription: "The all-in-one platform for modern UK driving instructors and driving schools. Manage your diary, pupil progress, payments, and generate AI lesson plans.",
        keywords: "driving instructor app, ADI software, PDI syllabus, driving school diary, driving lesson planner, AI lesson generator",
        ogTitle: "DriveSwift | AI-Powered Platform for Driving Instructors",
        ogDescription: "Manage your driving school, track pupil progress, and generate AI lesson plans with DriveSwift.",
        ogImage: "https://placehold.co/1200x630.png",
        canonicalUrl: "https://driveswift.app",
    },
    hero: {
        title: "The AI-Powered Platform for Modern Driving Instructors",
        subtitle: "Stop juggling spreadsheets and clunky software. DriveSwift brings everything you need to run your driving school into one smart, intuitive platform.",
        socialProof: "Used by over 1000 driving instructors and 15,000 pupils every week.",
        imageUrl: "https://placehold.co/1920x1080.png",
        titleTag: 'h1',
        subtitleTag: 'p',
        socialProofTag: 'p',
    },
    features: {
        title: "Why Choose DriveSwift?",
        subtitle: "DriveSwift is more than just a diary. It's a complete toolkit designed to save you time, improve lesson quality, and grow your business.",
        items: initialFeatures,
        headingTag: 'h2'
    },
    pricing: {
        title: "Simple, Transparent Pricing",
        subtitle: "Choose the plan that's right for you. No hidden fees, no complex contracts.",
        headingTag: 'h2',
        tiers: [
            { id: 'tier-1', name: "PDI", price: "Free", priceSuffix: "", description: "For Potential Driving Instructors starting their journey.", features: ["Diary & Lesson Gaps", "Free Instructor App", "Free Pupil & Parent App", "Progress Syllabus", "Reflective Logs", "Finances", "Free Lesson Reminders", "Free Payment Reminders", "Enquiry Manager", "online booking", "teaching Aids"], buttonText: "Sign Up as a PDI", popular: false },
            { id: 'tier-2', name: "Solo", price: "£10", priceSuffix: "/ month", description: "Perfect for the independent driving instructor.", features: ["1 instructor", "up to 10 students", "Diary & Lesson Gaps", "Free Instructor App", "Free Pupil & Parent App", "Progress Syllabus", "Reflective Logs", "Finances", "Free Lesson Reminders", "Free Payment Reminders", "Enquiry Manager", "online booking", "teaching Aids"], buttonText: "Start Free Trial", popular: false },
            { id: 'tier-3', name: "School", price: "£25", priceSuffix: "/ month", description: "For small to medium-sized driving schools.", features: ["5 instructors", "150 students", "Diary & Lesson Gaps", "Free Instructor App", "Free Pupil & Parent App", "Progress Syllabus", "Reflective Logs", "Finances", "Free Lesson Reminders", "Free Payment Reminders", "Enquiry Manager", "online booking", "teaching Aids"], buttonText: "Start Free Trial", popular: true },
            { id: 'tier-4', name: "Academy", price: "£100", priceSuffix: "/ month", description: "For established schools looking to expand.", features: ["10 instructors", "1000 students", "Diary & Lesson Gaps", "Free Instructor App", "Free Pupil & Parent App", "Progress Syllabus", "Reflective Logs", "Finances", "Free Lesson Reminders", "Free Payment Reminders", "Enquiry Manager", "online booking", "teaching Aids"], buttonText: "Start Free Trial", popular: false },
            { id: 'tier-5', name: "Enterprise", price: "Contact Us", priceSuffix: "", description: "Tailored solutions for large franchises and organisations.", features: ["50+ instructors", "unlimited students", "Diary & Lesson Gaps", "Free Instructor App", "Free Pupil & Parent App", "Progress Syllabus", "Reflective Logs", "Finances", "Free Lesson Reminders", "Free Payment Reminders", "Enquiry Manager", "online booking", "teaching Aids"], buttonText: "Contact Sales", popular: false }
        ],
        globalFeatures: [
            {id: 'gf-1', text: "Online with Apple & Android apps."},
            {id: 'gf-2', text: "Discounts available for multi-car schools."},
            {id: 'gf-3', text: "No payment details required for the trial period."},
            {id: 'gf-4', text: "Free lesson and payment reminders."},
            {id: 'gf-5', text: "Free pupil and parent portals."},
        ]
    },
    testimonials: {
        title: "What Our Instructors Say",
        subtitle: "Thousands of instructors have transformed their business with DriveSwift.",
        items: initialTestimonials,
        headingTag: 'h2',
        autoplay: true,
        stopOnHover: true,
        autoplayDelay: 4000
    },
    imageText: [
        {
            id: 'it-1',
            imageUrl: "https://placehold.co/400x400.png",
            title: "Ready to Grow Your Business?",
            paragraphs: ["Join hundreds of driving schools who have streamlined their operations, reduced admin, and increased their pass rates with DriveSwift. Our platform provides everything you need to succeed in one simple package."],
            buttonText: "Sign Up Today",
            buttonLink: "/sign-up",
            titleTag: "h2",
            layout: "imageLeft"
        },
        {
            id: 'it-2',
            imageUrl: "https://placehold.co/400x400.png",
            title: "Engage Your Pupils Like Never Before",
            paragraphs: ["Give your students the tools they need to succeed with our dedicated Pupil App. They can track their progress, review lesson notes from their instructor, access training materials, and book their next lesson directly from their phone.", "This level of engagement keeps them motivated and leads to better, faster results."],
            buttonText: "Learn More",
            buttonLink: "#features",
            titleTag: "h2",
            layout: "imageRight"
        }
    ],
    faq: {
        title: "Frequently Asked Questions",
        subtitle: "Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.",
        headingTag: 'h2',
        categories: initialFaqCategories,
    },
    footer: {
        copyright: `© ${new Date().getFullYear()} DriveSwift. All rights reserved.`,
        newsletterTitle: 'Subscribe to our newsletter',
        newsletterDescription: 'Get the latest news, updates, and tips for driving instructors.',
        newsletterPlaceholder: 'Enter your email',
        newsletterButton: 'Subscribe',
        columns: [
            {
                id: 'col-1',
                title: 'Product',
                links: [
                    { id: 'link-1-1', text: 'Features', url: '#features' },
                    { id: 'link-1-2', text: 'Pricing', url: '#pricing' },
                    { id: 'link-1-3', text: 'Testimonials', url: '#testimonials' },
                    { id: 'link-1-4', text: 'Install App (PWA)', url: '#install-pwa' },
                ]
            },
            {
                id: 'col-2',
                title: 'Company',
                links: [
                    { id: 'link-2-1', text: 'About Us', url: '/about' },
                    { id: 'link-2-2', text: 'Contact Us', url: '/contact' },
                ]
            },
            {
                id: 'col-3',
                title: 'Legal & Compliance',
                links: [
                    { id: 'link-3-1', text: 'Terms & Conditions', url: '/terms-and-conditions' },
                    { id: 'link-3-2', text: 'Privacy Policy', url: '/privacy-policy' },
                    { id: 'link-3-3', text: 'Cookie Policy', url: '/cookie-policy' },
                    { id: 'link-3-4', text: 'Terms of Service', url: '/terms-of-service' },
                ]
            }
        ],
        socials: [
            { id: 'social-1', platform: 'Facebook', url: 'https://facebook.com' },
            { id: 'social-2', platform: 'Twitter', url: 'https://twitter.com' },
            { id: 'social-3', platform: 'Instagram', url: 'https://instagram.com' },
        ],
    }
  });

  const [editingSection, setEditingSection] = useState<SectionKeys | null>(null);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

  const plugin = useRef(
    Autoplay({ delay: content.testimonials.autoplayDelay, stopOnInteraction: content.testimonials.stopOnHover })
  );

  const [isSyncing, setIsSyncing] = useState(false);
  const [isFirestoreLoaded, setIsFirestoreLoaded] = useState(false);

  const handleFullSyncToDatabase = async () => {
    setIsSyncing(true);
    try {
      await setDoc(doc(db, "cms", "landing_page"), content);
      setIsFirestoreLoaded(true);
      toast({
        title: "Home Page Synced to Firestore!",
        description: "All home page data has been successfully written to /cms/landing_page in Firestore.",
      });
    } catch (err: any) {
      console.error("Sync error:", err);
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "Failed to write data to Firestore: " + err.message,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    setIsSuperAdmin(searchParams.get('instructorId') === 'super-admin');
  }, [searchParams]);

  useEffect(() => {
    async function loadCmsContent() {
      try {
        const docRef = doc(db, "cms", "landing_page");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(prev => ({
            ...prev,
            ...docSnap.data()
          }));
          setIsFirestoreLoaded(true);
        } else {
          // Document does not exist in Firestore yet -> seed initial content automatically
          await setDoc(docRef, content);
          setIsFirestoreLoaded(true);
          console.log("Seeded initial landing page data to Firestore /cms/landing_page");
        }
      } catch (err) {
        console.error("Error loading CMS content from Firestore:", err);
      }
    }
    loadCmsContent();
  }, []);

  useEffect(() => {
    if (!content.seo) return;
    if (content.seo.metaTitle) {
      document.title = content.seo.metaTitle;
    }
    
    const updateMeta = (name: string, property: string, val?: string) => {
      if (!val) return;
      let el = name 
        ? document.querySelector(`meta[name="${name}"]`) 
        : document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        if (name) el.setAttribute('name', name);
        if (property) el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };

    updateMeta('description', '', content.seo.metaDescription);
    updateMeta('keywords', '', content.seo.keywords);
    updateMeta('', 'og:title', content.seo.ogTitle || content.seo.metaTitle);
    updateMeta('', 'og:description', content.seo.ogDescription || content.seo.metaDescription);
    updateMeta('', 'og:image', content.seo.ogImage);
  }, [content.seo]);

  const handleSaveSection = async (section: SectionKeys, newContent: any) => {
    const updatedContent = produce(content, draft => {
      draft[section] = newContent;
    });
    setContent(updatedContent);

    try {
      await setDoc(doc(db, "cms", "landing_page"), updatedContent, { merge: true });
      setIsFirestoreLoaded(true);
      toast({
        title: `${section.charAt(0).toUpperCase() + section.slice(1)} Section Saved!`,
        description: "Your changes have been saved to Firestore.",
      });
    } catch (err: any) {
      console.error("Failed to save to Firestore:", err);
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Updated locally, but failed to write to Firestore: " + err.message,
      });
    }
  };
  
  const renderTextWithTag = (text: string, tag: Tag, className: string) => {
    const Tag = tag;
    return (
        <Tag className={cn(className)}>
            {text}
        </Tag>
    );
  };

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    toast({
        title: "Subscribed!",
        description: `Thanks for subscribing, ${email}!`,
    });
    e.currentTarget.reset();
  }

  const AdminEditButton = ({ onEdit }: { onEdit: () => void }) => {
    if (!isSuperAdmin) return null;
    return (
        <Button onClick={onEdit} className="absolute top-4 right-4 z-20">
            <Edit className="mr-2 h-4 w-4" />
            Edit Section
        </Button>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
        {editingSection && (
            <SectionEditDialog 
                section={editingSection}
                content={content[editingSection]}
                isOpen={!!editingSection}
                onOpenChange={() => setEditingSection(null)}
                onSave={handleSaveSection}
            />
        )}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="font-bold">DriveSwift</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
             {isSuperAdmin && (
              <>
                <Button variant="outline" size="sm" onClick={() => setEditingSection('seo')} className="gap-2 border-blue-500/50 text-blue-600 hover:bg-blue-50 dark:text-blue-400">
                  <Globe className="h-4 w-4" />
                  SEO Settings
                </Button>
                <Button variant="outline" size="sm" onClick={handleFullSyncToDatabase} disabled={isSyncing} className="gap-2">
                  <Save className="h-4 w-4 text-primary" />
                  {isSyncing ? "Syncing..." : "Sync Home Page to Firestore"}
                </Button>
                <Button variant="ghost" asChild>
                  <a href={`/dashboard?${searchParams.toString()}`}>Back to Dashboard</a>
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsPwaModalOpen(true)} className="gap-1.5 text-xs border-primary/30 hover:bg-primary/5">
                <Smartphone className="h-3.5 w-3.5 text-primary" />
                Install App
            </Button>
            <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
                <Link href="/sign-up">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative w-full h-[60vh] flex items-center justify-center text-center text-white">
            <AdminEditButton onEdit={() => setEditingSection('hero')} />
            <Image 
                src={content.hero.imageUrl}
                alt="Driving lesson on an open road"
                fill
                className="object-cover"
                data-ai-hint="driving lesson road"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 space-y-6 max-w-3xl mx-auto p-4">
                {renderTextWithTag(content.hero.title, content.hero.titleTag, "text-4xl font-bold leading-tight tracking-tighter sm:text-5xl md:text-6xl")}
                {renderTextWithTag(content.hero.subtitle, content.hero.subtitleTag, "mt-4 text-lg text-white/90")}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                    <Link href="/sign-up">Start Your Free Trial</Link>
                </Button>
                </div>
                {renderTextWithTag(content.hero.socialProof, content.hero.socialProofTag, "text-sm text-white/80 pt-4")}
            </div>
        </section>

        <section id="features" className="relative w-full py-12 md:py-20 bg-muted/50">
            <AdminEditButton onEdit={() => setEditingSection('features')} />
            <div className="container mx-auto">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                    {renderTextWithTag(content.features.title, content.features.headingTag, "text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl")}
                    {renderTextWithTag(content.features.subtitle, 'p', "max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7")}
                </div>
                <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:grid-cols-3 lg:gap-12 mt-16">
                    {content.features.items.map((feature, index) => {
                      const Icon = icons[feature.icon];
                      return (
                        <div key={index} className="flex flex-col items-start gap-4 p-6 bg-background rounded-lg shadow-sm transition-transform duration-300 hover:scale-105">
                            <Icon className="h-10 w-10 text-primary" />
                            <h3 className="text-xl font-bold">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                      )
                    })}
                </div>
            </div>
        </section>
        
        <div className="py-8 md:py-12">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
        </div>

        <section id="pricing" className="relative w-full py-12 md:py-20 bg-muted/50">
            <AdminEditButton onEdit={() => setEditingSection('pricing')} />
            <div className="container mx-auto">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                    {renderTextWithTag(content.pricing.title, content.pricing.headingTag, "text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl")}
                    {renderTextWithTag(content.pricing.subtitle, 'p', "max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-12 max-w-7xl mx-auto">
                    {content.pricing.tiers.map((tier) => (
                        <Card key={tier.id} className={cn("flex flex-col", tier.popular ? "border-primary border-2 shadow-lg relative" : "shadow-sm")}>
                           {tier.popular && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
                           )}
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                                <CardDescription>{tier.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col flex-grow">
                                <div className="text-center mb-6">
                                    <span className="text-4xl font-bold">{tier.price}</span>
                                    {tier.priceSuffix && <span className="text-muted-foreground">{tier.priceSuffix}</span>}
                                </div>
                                <ul className="space-y-3 text-muted-foreground flex-grow mb-8">
                                    {tier.features.slice(0, 4).map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                    {tier.features.length > 4 && (
                                        <Collapsible open={isPricingExpanded} onOpenChange={setIsPricingExpanded}>
                                            <CollapsibleContent className="space-y-3">
                                                {tier.features.slice(4).map((feature, index) => (
                                                     <li key={index} className="flex items-start gap-2">
                                                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </CollapsibleContent>
                                            <CollapsibleTrigger asChild>
                                                <button className="flex items-center gap-2 text-sm font-semibold text-primary mt-3">
                                                    {isPricingExpanded ? "See less" : "See more"} <ChevronDown className={cn("h-4 w-4 transition-transform", isPricingExpanded && "rotate-180")} />
                                                </button>
                                            </CollapsibleTrigger>
                                        </Collapsible>
                                    )}
                                </ul>
                                <Button asChild variant={tier.popular ? "default" : "outline"} className="w-full mt-auto">
                                    <Link href="/sign-up">{tier.buttonText}</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="max-w-4xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-3 gap-6 text-muted-foreground text-sm">
                    {content.pricing.globalFeatures.map((feature) => (
                        <div key={feature.id} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{feature.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section id="testimonials" className="relative w-full py-12 md:py-20">
          <AdminEditButton onEdit={() => setEditingSection('testimonials')} />
          <div className="container mx-auto">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              {renderTextWithTag(content.testimonials.title, content.testimonials.headingTag, "text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl")}
              {renderTextWithTag(content.testimonials.subtitle, 'p', "max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7")}
            </div>
            <Carousel
              plugins={content.testimonials.autoplay ? [plugin.current] : []}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-6xl mx-auto mt-12"
            >
              <CarouselContent>
                {content.testimonials.items.map((testimonial, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <Card className="flex flex-col justify-between h-full">
                        <CardContent className="p-6 flex flex-col items-start text-left h-full">
                          <p className="text-lg font-semibold mb-4 flex-grow">&quot;{testimonial.quote}&quot;</p>
                          <div>
                            <p className="font-bold">{testimonial.author}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.school}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </section>

         <section id="image-text-section" className="relative w-full py-8 md:py-16 bg-background">
            <AdminEditButton onEdit={() => setEditingSection('imageText')} />
            <div className="container mx-auto flex flex-col gap-16">
                 {content.imageText.map((item, index) => (
                    <div key={item.id} className="flex flex-col">
                        {index > 0 && <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-8 md:my-12"></div>}
                        <div className="grid md:grid-cols-3 gap-12 items-center">
                            <div className={cn("relative aspect-square rounded-lg overflow-hidden", item.layout === 'imageRight' && 'md:order-last')}>
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    data-ai-hint="driving school app"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-6">
                                {renderTextWithTag(item.title, item.titleTag, "text-3xl font-bold leading-[1.1] sm:text-3xl md:text-4xl")}
                                {item.paragraphs.map((p, pIndex) => (
                                    <p key={pIndex} className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">{p}</p>
                                ))}
                                {item.buttonText && (
                                    <Button size="lg" asChild>
                                        <Link href={item.buttonLink}>{item.buttonText}</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        <section id="faq" className="relative w-full py-12 md:py-20 bg-muted/50">
          <AdminEditButton onEdit={() => setEditingSection('faq')} />
          <div className="container mx-auto max-w-4xl">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              {renderTextWithTag(content.faq.title, content.faq.headingTag, "text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl")}
              {renderTextWithTag(content.faq.subtitle, 'p', "max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7")}
            </div>

            {content.faq.categories.length > 0 && (
                <Tabs defaultValue={content.faq.categories[0].id} className="w-full mt-12">
                    <TabsList className="grid w-full grid-cols-3">
                        {content.faq.categories.map(category => (
                            <TabsTrigger key={category.id} value={category.id}>{category.title}</TabsTrigger>
                        ))}
                    </TabsList>
                    {content.faq.categories.map(category => (
                        <TabsContent key={category.id} value={category.id} className="pt-6">
                            <Accordion type="single" collapsible className="w-full">
                                {category.items.map((item, index) => (
                                    <AccordionItem value={`item-${category.id}-${index}`} key={index}>
                                        <AccordionTrigger className="text-lg text-left">{item.question}</AccordionTrigger>
                                        <AccordionContent className="text-base text-muted-foreground prose">
                                            {item.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </TabsContent>
                    ))}
                </Tabs>
            )}
          </div>
        </section>

      </main>

      <footer className="relative border-t bg-background">
        <AdminEditButton onEdit={() => setEditingSection('footer')} />
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-5 space-y-4">
                    <Link href="/" className="inline-flex items-center space-x-2">
                        <Car className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold">DriveSwift</span>
                    </Link>
                    <p className="text-muted-foreground">{content.footer.newsletterDescription}</p>
                    <form className="flex space-x-2" onSubmit={handleNewsletterSubmit}>
                        <Input type="email" name="email" placeholder={content.footer.newsletterPlaceholder} className="max-w-lg flex-1" />
                        <Button type="submit">{content.footer.newsletterButton}</Button>
                    </form>
                    <div className="flex items-center space-x-4 pt-2">
                        {content.footer.socials.map((social) => {
                             const Icon = socialIcons[social.platform];
                             return (
                                <Link key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                    <Icon className="h-6 w-6" />
                                    <span className="sr-only">{social.platform}</span>
                                </Link>
                             )
                        })}
                    </div>
                </div>
                <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
                      {content.footer.columns.map((column) => (
                        <div key={column.id} className="space-y-4">
                            <h4 className="font-semibold text-foreground">{column.title}</h4>
                            <ul className="space-y-2">
                                {column.links.map((link) => {
                                    if (link.url === '#install-pwa' || link.url === '/install') {
                                        return (
                                            <li key={link.id}>
                                                <button
                                                    onClick={() => setIsPwaModalOpen(true)}
                                                    className="text-muted-foreground hover:text-primary transition-colors text-left flex items-center gap-1.5 font-medium cursor-pointer"
                                                >
                                                    <Smartphone className="h-3.5 w-3.5 text-primary" />
                                                    {link.text}
                                                </button>
                                            </li>
                                        );
                                    }
                                    return (
                                        <li key={link.id}>
                                            <Link href={link.url} className="text-muted-foreground hover:text-primary transition-colors">
                                                {link.text}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-12 pt-8 border-t">
                 <p className="text-sm text-muted-foreground text-center">{content.footer.copyright}</p>
            </div>
        </div>
      </footer>
      <PwaInstallModal isOpen={isPwaModalOpen} onOpenChange={setIsPwaModalOpen} />
    </div>
  );
}
