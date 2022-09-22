import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Center,
} from "@chakra-ui/react";
import { useHashParamInt } from "@metapages/hash-query";
import { TabPanelCommand } from "/@/components/TabPanelCommand";
import { TabPanelUpload } from "../components/TabPanelUpload";
import { StatusIcon } from "../components/StatusIcon";

export const Route: React.FC = () => {
  const [tabIndex, setTabIndex] = useHashParamInt("tab", 0);

  return (
    <VStack spacing={10} width="100%" alignItems="stretch">
      <Tabs index={tabIndex} onChange={setTabIndex}>
        <TabList>
          <Center p={2}>
            <StatusIcon />
          </Center>
          <Tab>Command</Tab>
          <Tab>Upload</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <TabPanelCommand />
          </TabPanel>

          <TabPanel>
            <TabPanelUpload />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};
