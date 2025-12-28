import { Card } from '@/components/ui/card'
import { Table } from './table'
import { CpuArchitecture } from './cpu-architecture'
import { AnimatedListCustom } from './animated-list-custom'
  

export default function FeaturesOne() {
    return (
        <section className="py-12 md:py-16">
            <div className="">
                <div className="mx-auto w-full max-w-5xl px-6">
                    <div className="text-center" id="features">
                        <h2 className="text-foreground text-4xl font-semibold">Feature Requests That Actually Get Built</h2>
                        <p className="text-muted-foreground mb-8 mt-4 text-balance text-lg">Empower your users to share ideas, vote on features, and see their feedback turn into reality. Track, prioritize, and manage feature requests with intelligent insights throughout the entire user lifecycle.</p>
                        <div className="bg-foreground/5 rounded-3xl p-6">
                            <Table />
                        </div>
                    </div>

                    <div className="border-foreground/10 relative mt-12 grid gap-8 border-b pb-8 [--radius:1rem] md:grid-cols-2">
                        <div>
                            <h3 className="text-foreground text-xl font-semibold">Intelligent Prioritization</h3>
                            <p className="text-muted-foreground my-4 text-lg">See what features matter most with voting, engagement metrics, and smart categorization. Make data-driven product decisions.</p>
                            <Card
                                className="aspect-video overflow-hidden px-6">
                                <Card className="h-full translate-y-6 rounded-b-none border-b-0 bg-muted/50">
                                    <CpuArchitecture />
                                </Card>
                            </Card>
                        </div>
                        <div>
                            <h3 className="text-foreground text-xl font-semibold">Real-Time Updates</h3>
                            <p className="text-muted-foreground my-4 text-lg">Keep users in the loop as their feature requests move from idea to reality. Build trust through transparency.</p>
                            <Card
                                className="aspect-video overflow-hidden">
                                <Card className="translate-6 h-full rounded-bl-none border-b-0 border-r-0 bg-muted/50 pt-6 pb-0">
                                    <AnimatedListCustom />
                                </Card>
                            </Card>
                        </div>
                    </div>

                    <blockquote className="before:bg-primary relative mt-8 max-w-xl pl-6 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full">
                        <p className="text-foreground text-lg">UserVibes OS is more than feature requests. Capture user signals throughout their entire journey—from landing page surveys to exit feedback. Build products users love.</p>
                        <footer className="mt-4 flex items-center gap-2">
                            <cite>The UserVibes Vision</cite>
                            <span
                                aria-hidden
                                className="bg-foreground/15 size-1 rounded-full"></span>
                            <span className="text-muted-foreground">Coming Soon</span>
                        </footer>
                    </blockquote>
                </div>
            </div>
        </section>
    )
}
