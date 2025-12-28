export default function FAQs() {
    return (
        <section className="scroll-py-12 py-12 md:scroll-py-16 md:py-16">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-y-12 px-2 lg:[grid-template-columns:1fr_auto]">
                    <div className="text-center lg:text-left">
                        <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
                            Frequently <br className="hidden lg:block" /> Asked <br className="hidden lg:block" />
                            Questions
                        </h2>
                        <p>Everything you need to know about UserVibes OS</p>
                    </div>

                    <div className="divide-y divide-dashed sm:mx-auto sm:max-w-lg lg:mx-0">
                        <div className="pb-6">
                            <h3 className="font-medium">What is UserVibes OS?</h3>
                            <p className="text-muted-foreground mt-4">UserVibes OS is a comprehensive user feedback platform designed to capture user signals throughout their entire journey. We're launching with feature request management, allowing you to collect, prioritize, and act on user ideas.</p>

                            <ul className="list-outside list-disc space-y-2 pl-4">
                                <li className="text-muted-foreground mt-4"><strong>Attract & Qualify:</strong> Landing page funnels and surveys</li>
                                <li className="text-muted-foreground">🎯 <strong>Ideate & Resolve:</strong> Feature requests and bug reports (Available Now)</li>
                                <li className="text-muted-foreground mt-4"><strong>Measure & Amplify:</strong> Sentiment surveys and testimonials</li>
                                <li className="text-muted-foreground mt-4"><strong>Nurture & Recapture:</strong> Email campaigns and exit feedback</li>
                            </ul>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">How does feature request voting work?</h3>
                            <p className="text-muted-foreground mt-4">Users can submit feature requests and upvote ideas they care about. This helps you identify which features to prioritize based on real user demand, not just gut feelings. Each user can vote on multiple features, and the system tracks engagement to surface the most requested improvements.</p>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">What features are coming next?</h3>
                            <p className="text-muted-foreground my-4">We're building UserVibes OS as a complete feedback ecosystem. After feature requests, we'll be rolling out:</p>
                            <ul className="list-outside list-disc space-y-2 pl-4">
                                <li className="text-muted-foreground">Bug reporting and issue tracking</li>
                                <li className="text-muted-foreground">Sentiment surveys and NPS scoring</li>
                                <li className="text-muted-foreground">Testimonial collection and display</li>
                                <li className="text-muted-foreground">Email nurture campaigns</li>
                                <li className="text-muted-foreground">Exit feedback and win-back flows</li>
                            </ul>
                        </div>
                        <div className="py-6">
                            <h3 className="font-medium">Is UserVibes OS free to use?</h3>
                            <p className="text-muted-foreground mt-4">Yes! We offer a generous free tier to help you get started with collecting feature requests. As we add more functionality to the UserVibes OS platform, we'll introduce paid plans with advanced features like custom branding, analytics, and integrations.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
