
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const subscribers = [
    { email: "subscriber1@example.com", date: "2024-07-15", status: "Subscribed" },
    { email: "subscriber2@example.com", date: "2024-07-14", status: "Subscribed" },
    { email: "subscriber3@example.com", date: "2024-07-13", status: "Unsubscribed" },
    { email: "subscriber4@example.com", date: "2024-07-12", status: "Subscribed" },
    { email: "subscriber5@example.com", date: "2024-07-11", status: "Subscribed" },
];

export default function NewsletterAdminPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Newsletter Subscribers</CardTitle>
                <CardDescription>
                    A list of users subscribed to your newsletter. In a real app, you would integrate this with a service like Mailchimp.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Subscription Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscribers.map((subscriber) => (
                            <TableRow key={subscriber.email}>
                                <TableCell className="font-medium">{subscriber.email}</TableCell>
                                <TableCell>{subscriber.date}</TableCell>
                                <TableCell>
                                    <Badge variant={subscriber.status === "Subscribed" ? "secondary" : "outline"}>
                                        {subscriber.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
