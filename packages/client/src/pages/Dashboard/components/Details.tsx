import { Icon } from "@iconify/react";
import { Button, Tabs, Text, Timeline } from "@mantine/core";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { CandleChart } from "@/components/TradingView/CandleChart";

export const Details = () => {
  // DRAW
  return (
    <CollapsiblePanel containerClassName="flex-4" title="Details">
      <Tabs variant="pills" color="dark" defaultValue="gallery">
        <Tabs.List>
          <Tabs.Tab value="gallery">Timeline</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel
          className="w-full h-full pt-5 px-5 flex flex-col gap-2"
          value="gallery"
        >
          <div className="w-full h-full grid grid-rows-2">
            <Timeline active={1} bulletSize={24} lineWidth={2}>
              <Timeline.Item
                // bullet={<IconGitBranch size={12} />}
                title="New branch"
              >
                <Text c="dimmed" size="sm">
                  You&apos;ve created new branch{" "}
                  <Text variant="link" component="span" inherit>
                    fix-notifications
                  </Text>{" "}
                  from master
                </Text>
                <Text size="xs" mt={4}>
                  2 hours ago
                </Text>
              </Timeline.Item>

              <Timeline.Item title="Commits">
                <Text c="dimmed" size="sm">
                  You&apos;ve pushed 23 commits to
                  <Text variant="link" component="span" inherit>
                    fix-notifications branch
                  </Text>
                </Text>
                <Text size="xs" mt={4}>
                  52 minutes ago
                </Text>
              </Timeline.Item>

              <Timeline.Item title="Pull request" lineVariant="dashed">
                <Text c="dimmed" size="sm">
                  You&apos;ve submitted a pull request
                  <Text variant="link" component="span" inherit>
                    Fix incorrect notification message (#187)
                  </Text>
                </Text>
                <Text size="xs" mt={4}>
                  34 minutes ago
                </Text>
              </Timeline.Item>

              <Timeline.Item title="Code review">
                <Text c="dimmed" size="sm">
                  <Text variant="link" component="span" inherit>
                    Robert Gluesticker
                  </Text>{" "}
                  left a code review on your pull request
                </Text>
                <Text size="xs" mt={4}>
                  12 minutes ago
                </Text>
              </Timeline.Item>
            </Timeline>
            <CandleChart />
          </div>
        </Tabs.Panel>
        <Tabs.Panel className="w-full h-full pt-2" value="messages">
          <Button
            leftSection={
              <Icon icon="material-symbols:add" height={18} width={18} />
            }
            fullWidth
          >
            Add Company to Schedule Shortlist
          </Button>
        </Tabs.Panel>
      </Tabs>
    </CollapsiblePanel>
  );
};
