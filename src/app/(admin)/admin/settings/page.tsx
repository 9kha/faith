import { getSettingsByGroup } from "@/lib/settings";
import { SettingGroup } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Input,
} from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

const groups: SettingGroup[] = [
  "BRANDING",
  "SMTP",
  "INTEGRATIONS",
  "THEME",
  "SYSTEM",
];

export default async function SettingsPage() {
  const settingsByGroup = await Promise.all(
    groups.map((g) => getSettingsByGroup(g).then((s) => ({ group: g, settings: s })))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <Button>Save Changes</Button>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="w-full">
          {groups.map((g) => (
            <TabsTrigger key={g} value={g.toLowerCase()}>
              {g}
            </TabsTrigger>
          ))}
        </TabsList>

        {settingsByGroup.map(({ group, settings }) => (
          <TabsContent key={group} value={group.toLowerCase()} className="p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {settings.map((setting) => (
                <Card key={setting.key} className="p-4">
                  <CardHeader className="flex flex-col space-y-1">
                    <CardTitle className="text-sm font-medium">{setting.key}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {setting.group}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      defaultValue={String(setting.value)}
                      className="text-sm font-mono bg-muted"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
