"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bell, Lock, Eye, Moon, Sun, Smartphone, Laptop, Mail } from "lucide-react"

export default function SettingsPage() {
	return (
		<div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Settings</h2>
					<p className="text-muted-foreground">Manage your account preferences</p>
				</div>
				<div className="flex items-center gap-2">
					<Button onClick={() => window.alert("Settings saved successfully!")}>Save Changes</Button>
				</div>
			</div>

			<Tabs defaultValue="general" className="space-y-4">
				<TabsList className="bg-muted/50 p-1">
					<TabsTrigger value="general" className="rounded-md">
						General
					</TabsTrigger>
					<TabsTrigger value="notifications" className="rounded-md">
						Notifications
					</TabsTrigger>
					<TabsTrigger value="privacy" className="rounded-md">
						Privacy
					</TabsTrigger>
					<TabsTrigger value="appearance" className="rounded-md">
						Appearance
					</TabsTrigger>
				</TabsList>

				<TabsContent value="general" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>General Settings</CardTitle>
							<CardDescription>Manage your basic account settings</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="language">Language</Label>
									<Select defaultValue="en">
										<SelectTrigger id="language">
											<SelectValue placeholder="Select language" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="en">English</SelectItem>
											<SelectItem value="es">Spanish</SelectItem>
											<SelectItem value="fr">French</SelectItem>
											<SelectItem value="de">German</SelectItem>
											<SelectItem value="zh">Chinese</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="timezone">Timezone</Label>
									<Select defaultValue="est">
										<SelectTrigger id="timezone">
											<SelectValue placeholder="Select timezone" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
											<SelectItem value="cst">Central Standard Time (CST)</SelectItem>
											<SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
											<SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<Separator />

							<div className="space-y-2">
								<Label htmlFor="currency">Currency</Label>
								<Select defaultValue="usd">
									<SelectTrigger id="currency">
										<SelectValue placeholder="Select currency" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="usd">US Dollar (USD)</SelectItem>
										<SelectItem value="eur">Euro (EUR)</SelectItem>
										<SelectItem value="gbp">British Pound (GBP)</SelectItem>
										<SelectItem value="cad">Canadian Dollar (CAD)</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="date-format">Date Format</Label>
								<Select defaultValue="mdy">
									<SelectTrigger id="date-format">
										<SelectValue placeholder="Select date format" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="mdy">MM/DD/YYYY</SelectItem>
										<SelectItem value="dmy">DD/MM/YYYY</SelectItem>
										<SelectItem value="ymd">YYYY/MM/DD</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<Separator />

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="session-timeout">Session Timeout</Label>
									<p className="text-sm text-muted-foreground">Automatically log out after period of inactivity</p>
								</div>
								<Select defaultValue="30">
									<SelectTrigger id="session-timeout" className="w-[180px]">
										<SelectValue placeholder="Select timeout period" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="15">15 minutes</SelectItem>
										<SelectItem value="30">30 minutes</SelectItem>
										<SelectItem value="60">1 hour</SelectItem>
										<SelectItem value="120">2 hours</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Contact Information</CardTitle>
							<CardDescription>Update your contact details</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="email">Email Address</Label>
									<Input id="email" defaultValue="alex.johnson@example.com" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="phone">Phone Number</Label>
									<Input id="phone" defaultValue="(555) 123-4567" />
								</div>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="marketing-emails">Marketing Emails</Label>
									<p className="text-sm text-muted-foreground">
										Receive emails about new products, features, and offers
									</p>
								</div>
								<Switch id="marketing-emails" defaultChecked={true} />
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="notifications" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Notification Preferences</CardTitle>
							<CardDescription>Configure how you receive notifications</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-4">
								<h3 className="text-sm font-medium">Email Notifications</h3>
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="payment-reminder">Payment Reminders</Label>
										<p className="text-sm text-muted-foreground">Receive notifications when payments are due</p>
									</div>
									<Switch id="payment-reminder" defaultChecked />
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="statement-ready">Statement Notifications</Label>
										<p className="text-sm text-muted-foreground">
											Receive notifications when new statements are available
										</p>
									</div>
									<Switch id="statement-ready" defaultChecked />
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="application-updates">Application Updates</Label>
										<p className="text-sm text-muted-foreground">Receive notifications about your loan applications</p>
									</div>
									<Switch id="application-updates" defaultChecked />
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="promotional">Promotional Notifications</Label>
										<p className="text-sm text-muted-foreground">
											Receive notifications about special offers and promotions
										</p>
									</div>
									<Switch id="promotional" />
								</div>
							</div>

							<Separator className="my-4" />

							<div className="space-y-4">
								<h3 className="text-sm font-medium">SMS Notifications</h3>
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="sms-payment">Payment Reminders</Label>
										<p className="text-sm text-muted-foreground">Receive SMS notifications when payments are due</p>
									</div>
									<Switch id="sms-payment" defaultChecked />
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="sms-security">Security Alerts</Label>
										<p className="text-sm text-muted-foreground">
											Receive SMS notifications for security-related events
										</p>
									</div>
									<Switch id="sms-security" defaultChecked />
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Notification Delivery</CardTitle>
							<CardDescription>Choose how you want to receive notifications</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<div className="rounded-lg border p-4 text-center">
										<Bell className="mx-auto mb-2 h-8 w-8 text-primary" />
										<h3 className="mb-1 font-medium">Push Notifications</h3>
										<p className="text-sm text-muted-foreground mb-4">Receive notifications on your device</p>
										<Switch id="push-enabled" defaultChecked />
									</div>
									<div className="rounded-lg border p-4 text-center">
										<Mail className="mx-auto mb-2 h-8 w-8 text-primary" />
										<h3 className="mb-1 font-medium">Email</h3>
										<p className="text-sm text-muted-foreground mb-4">Receive notifications via email</p>
										<Switch id="email-enabled" defaultChecked />
									</div>
									<div className="rounded-lg border p-4 text-center">
										<Smartphone className="mx-auto mb-2 h-8 w-8 text-primary" />
										<h3 className="mb-1 font-medium">SMS</h3>
										<p className="text-sm text-muted-foreground mb-4">Receive notifications via text message</p>
										<Switch id="sms-enabled" defaultChecked />
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="privacy" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Privacy Settings</CardTitle>
							<CardDescription>Manage your privacy preferences</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="data-collection">Data Collection</Label>
										<p className="text-sm text-muted-foreground">Allow us to collect data to improve your experience</p>
									</div>
									<Switch id="data-collection" defaultChecked />
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="third-party">Third-Party Sharing</Label>
										<p className="text-sm text-muted-foreground">Allow us to share your data with trusted partners</p>
									</div>
									<Switch id="third-party" />
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label htmlFor="cookies">Cookie Preferences</Label>
										<p className="text-sm text-muted-foreground">Manage how we use cookies on our website</p>
									</div>
									<Button variant="outline" size="sm" onClick={() => window.alert("Opening cookie preferences")}>
										Manage Cookies
									</Button>
								</div>
							</div>

							<div className="rounded-lg bg-primary/10 p-4 mt-4">
								<div className="flex items-start gap-4">
									<Lock className="mt-0.5 h-5 w-5 text-primary" />
									<div>
										<h4 className="text-sm font-medium">Privacy Policy</h4>
										<p className="text-sm text-muted-foreground mt-1">
											Our privacy policy explains how we collect, use, and protect your personal information.
										</p>
										<Button
											variant="link"
											className="p-0 h-auto mt-1"
											onClick={() => window.alert("Opening privacy policy")}
										>
											View Privacy Policy
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Account Visibility</CardTitle>
							<CardDescription>Control what information is visible to others</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="profile-visibility">Profile Visibility</Label>
									<p className="text-sm text-muted-foreground">Control who can see your profile information</p>
								</div>
								<Select defaultValue="private">
									<SelectTrigger id="profile-visibility" className="w-[180px]">
										<SelectValue placeholder="Select visibility" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="public">Public</SelectItem>
										<SelectItem value="contacts">Contacts Only</SelectItem>
										<SelectItem value="private">Private</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="activity-visibility">Activity Visibility</Label>
									<p className="text-sm text-muted-foreground">Control who can see your account activity</p>
								</div>
								<Select defaultValue="private">
									<SelectTrigger id="activity-visibility" className="w-[180px]">
										<SelectValue placeholder="Select visibility" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="public">Public</SelectItem>
										<SelectItem value="contacts">Contacts Only</SelectItem>
										<SelectItem value="private">Private</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="show-balance">Show Account Balance</Label>
									<p className="text-sm text-muted-foreground">Show your account balance when viewing your profile</p>
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 rounded-full"
										onClick={() => window.alert("Toggle balance visibility")}
									>
										<Eye className="h-4 w-4" />
									</Button>
									<Switch id="show-balance" />
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="appearance" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Appearance Settings</CardTitle>
							<CardDescription>Customize how the application looks</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-4">
								<h3 className="text-sm font-medium">Theme</h3>
								<div className="grid grid-cols-3 gap-4">
									<div className="rounded-lg border p-4 text-center hover:border-primary cursor-pointer">
										<Sun className="mx-auto mb-2 h-8 w-8 text-primary" />
										<h3 className="mb-1 font-medium">Light</h3>
										<Badge
											variant="outline"
											className="mx-auto"
											style={{
												backgroundColor: "hsl(var(--primary))",
												color: "black",
											}}
										>
											Active
										</Badge>
									</div>
									<div className="rounded-lg border p-4 text-center hover:border-primary cursor-pointer">
										<Moon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
										<h3 className="mb-1 font-medium">Dark</h3>
									</div>
									<div className="rounded-lg border p-4 text-center hover:border-primary cursor-pointer">
										<Laptop className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
										<h3 className="mb-1 font-medium">System</h3>
									</div>
								</div>
							</div>

							<Separator />

							<div className="space-y-4">
								<h3 className="text-sm font-medium">Font Size</h3>
								<div className="grid grid-cols-3 gap-4">
									<div className="rounded-lg border p-4 text-center hover:border-primary cursor-pointer">
										<h3 className="mb-1 font-medium text-sm">Small</h3>
									</div>
									<div className="rounded-lg border p-4 text-center hover:border-primary cursor-pointer">
										<h3 className="mb-1 font-medium">Medium</h3>
										<Badge
											variant="outline"
											className="mx-auto"
											style={{
												backgroundColor: "hsl(var(--primary))",
												color: "black",
											}}
										>
											Active
										</Badge>
									</div>
									<div className="rounded-lg border p-4 text-center hover:border-primary cursor-pointer">
										<h3 className="mb-1 font-medium text-lg">Large</h3>
									</div>
								</div>
							</div>

							<Separator />

							<div className="space-y-4">
								<h3 className="text-sm font-medium">Layout Density</h3>
								<div className="grid grid-cols-3 gap-4">
									<div className="rounded-lg border p-4 text-center hover:border-primary cursor-pointer">
										<h3 className="mb-1 font-medium">Compact</h3>
									</div>
									<div className="rounded-lg border p-4 text-center hover:border-primary cursor-pointer">
										<h3 className="mb-1 font-medium">Comfortable</h3>
										<Badge
											variant="outline"
											className="mx-auto"
											style={{
												backgroundColor: "hsl(var(--primary))",
												color: "black",
											}}
										>
											Active
										</Badge>
									</div>
									<div className="rounded-lg border p-4 text-center hover:border-primary cursor-pointer">
										<h3 className="mb-1 font-medium">Spacious</h3>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Accessibility</CardTitle>
							<CardDescription>Customize accessibility settings</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="high-contrast">High Contrast Mode</Label>
									<p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
								</div>
								<Switch id="high-contrast" />
							</div>
							<Separator />
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="reduce-motion">Reduce Motion</Label>
									<p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
								</div>
								<Switch id="reduce-motion" />
							</div>
							<Separator />
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="screen-reader">Screen Reader Optimization</Label>
									<p className="text-sm text-muted-foreground">Optimize the interface for screen readers</p>
								</div>
								<Switch id="screen-reader" />
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
