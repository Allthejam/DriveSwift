
"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { contactSubmissions as initialSubmissions, type ContactSubmission, instructors, Reply } from "@/lib/data"
import { format, formatDistanceToNow } from "date-fns"
import { LogIn, Mail, Trash2, Send, MessageSquare, Bug, Lightbulb, HelpCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"


function RespondDialog({ submission, onReply, onOpenChange }: { submission: ContactSubmission, onReply: (submissionId: string, reply: Reply) => void, onOpenChange: (open: boolean) => void }) {
    const [replyText, setReplyText] = useState("");

    const handleSendReply = () => {
        if (!replyText.trim()) return;

        const newReply: Reply = {
            from: 'Super Admin',
            message: replyText,
            date: new Date().toISOString(),
            isRead: false
        };
        onReply(submission.id, newReply);
        setReplyText("");
        onOpenChange(false);
    }
    
    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Respond to: {submission.subject}</DialogTitle>
                <DialogDescription>
                    From: {submission.name} ({submission.email})
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                 <h4 className="font-semibold text-lg">Message Thread</h4>
                 <ScrollArea className="h-64 w-full rounded-md border p-4">
                    <div className="space-y-4">
                        <div className="flex flex-col items-start gap-2">
                            <div className="rounded-lg bg-muted p-3">
                                <p className="text-sm">{submission.message}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{submission.name} - {format(new Date(submission.date), 'PP p')}</p>
                        </div>
                         {(submission.replies || []).map((reply, index) => (
                             <div key={index} className={cn("flex flex-col gap-2", reply.from === 'Super Admin' ? 'items-end' : 'items-start')}>
                                <div className={cn("rounded-lg p-3", reply.from === 'Super Admin' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                    <p className="text-sm">{reply.message}</p>
                                </div>
                                <p className="text-xs text-muted-foreground">{reply.from} - {format(new Date(reply.date), 'PP p')}</p>
                             </div>
                        ))}
                    </div>
                </ScrollArea>

                <div>
                    <Label htmlFor="reply-text">Your Reply</Label>
                    <Textarea
                        id="reply-text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your response here..."
                        className="mt-2"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleSendReply}>
                    <Send className="mr-2" />
                    Send Reply
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}

const categoryIcons = {
    'General': <MessageSquare className="h-5 w-5 text-muted-foreground" />,
    'Bug Report': <Bug className="h-5 w-5 text-destructive" />,
    'Feature Request': <Lightbulb className="h-5 w-5 text-yellow-500" />,
    'Account Help': <HelpCircle className="h-5 w-5 text-blue-500" />,
}

export default function ContactSubmissionsPage() {
    const [submissions, setSubmissions] = useState(initialSubmissions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    const { toast } = useToast()
    const [isRespondDialogOpen, setIsRespondDialogOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

    const markAsRead = (id: string) => {
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, isRead: true } : s))
        const sub = initialSubmissions.find(s => s.id === id)
        if(sub) sub.isRead = true
    }

    const deleteSubmission = (id: string) => {
        setSubmissions(prev => prev.filter(s => s.id !== id))
        const index = initialSubmissions.findIndex(s => s.id === id)
        if(index > -1) initialSubmissions.splice(index, 1)

        toast({
            title: "Submission Deleted",
            description: "The message has been permanently removed.",
        })
    }

     const handleOpenRespondDialog = (submission: ContactSubmission) => {
        setSelectedSubmission(submission);
        setIsRespondDialogOpen(true);
    };

    const handleReply = (submissionId: string, reply: Reply) => {
        const submissionIndex = initialSubmissions.findIndex(s => s.id === submissionId);
        if (submissionIndex > -1) {
            if (!initialSubmissions[submissionIndex].replies) {
                initialSubmissions[submissionIndex].replies = [];
            }
            initialSubmissions[submissionIndex].replies?.push(reply);
            setSubmissions([...initialSubmissions]);
        }
        
        toast({
            title: "Reply Sent",
            description: "Your reply has been sent to the user.",
        })
    }


    return (
        <div className="space-y-6">
            <Dialog open={isRespondDialogOpen} onOpenChange={setIsRespondDialogOpen}>
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Form Submissions</CardTitle>
                        <CardDescription>Messages received from the website contact form.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {submissions.map(sub => {
                                const instructor = instructors.find(i => i.email.toLowerCase() === sub.email.toLowerCase());

                                return (
                                <Card key={sub.id} className={!sub.isRead ? 'border-primary' : ''}>
                                    <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
                                        <Avatar>
                                            <AvatarFallback>{sub.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-semibold">{sub.name}</h4>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(sub.date), { addSuffix: true })}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{sub.email}</p>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3 mb-2">
                                            {categoryIcons[sub.category as keyof typeof categoryIcons]}
                                            <h5 className="font-semibold text-base">{sub.subject}</h5>
                                        </div>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">{sub.message}</p>
                                        <div className="flex gap-2 justify-end mt-4">
                                            <Button variant="secondary" onClick={() => handleOpenRespondDialog(sub)}>
                                                <MessageSquare className="mr-2" />
                                                Respond
                                            </Button>
                                            {instructor && (
                                                <Button asChild variant="secondary">
                                                    <Link href={`/dashboard?schoolId=${instructor.schoolId}&instructorId=${instructor.id}&ghost=true`}>
                                                        <LogIn className="mr-2" />
                                                        Ghost Login
                                                    </Link>
                                                </Button>
                                            )}
                                            {!sub.isRead && (
                                                <Button onClick={() => markAsRead(sub.id)}>
                                                    <Mail className="mr-2" /> Mark as Read
                                                </Button>
                                            )}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive">
                                                        <Trash2 className="mr-2" /> Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the message from the servers.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteSubmission(sub.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            )})}
                        </div>
                    </CardContent>
                </Card>
                {selectedSubmission && <RespondDialog submission={selectedSubmission} onReply={handleReply} onOpenChange={setIsRespondDialogOpen} />}
            </Dialog>
        </div>
    )
}
