import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle, ArrowRight } from "lucide-react";
import { prepareEVMTransactionVerification } from "@/flare";

const InsuranceDashboard = () => {
  const [activeInsurance, setActiveInsurance] = useState([
    {
      id: 1,
      protocol: "Aave",
      amount: "10,000 USDC",
      coverage: "8,000 USDC",
      startDate: "2024-10-01",
      endDate: "2025-10-01",
      status: "Active",
    },
  ]);

  const supportedProtocols = [
    { name: "Aave", coverage: "Up to 10,000 USDC" },
    // { name: "Compound", coverage: "Up to 15,000 USDC" },
    { name: "Uniswap", coverage: "Up to 5,000 USDC" },
  ];

  const verifyTransaction = async (transactionHash: string) => {
    // const requestBody: RequestBody = {
    //   transactionHash,
    //   requiredConfirmations: "1",
    //   provideInput: true,
    //   listEvents: true,
    //   logIndices: [],
    // };

    try {
      const result = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/verify-transaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            //   'X-API-KEY': 'your-api-key'
          },
          body: JSON.stringify({
            transactionHash: transactionHash,
            requiredConfirmations: "123",
            provideInput: true,
            listEvents: true,
            logIndices: ["123"],
          }),
        }
      );
      //   await prepareEVMTransactionVerification({
      //     apiKey,
      //     requestBody,
      //   });
      console.log(result);
      return result;
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Tabs defaultValue="new" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {/* <TabsTrigger value="new">Start Insurance</TabsTrigger> */}
          <TabsTrigger value="new">New Insurance</TabsTrigger>
          <TabsTrigger value="active">Active Policies</TabsTrigger>
          <TabsTrigger value="claim">File Claim</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Get Smart Contract Insurance</CardTitle>
              <CardDescription>
                Protect your funds against smart contract vulnerabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Protocol</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose protocol" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedProtocols.map((protocol) => (
                      <SelectItem key={protocol.name} value={protocol.name}>
                        {protocol.name} - {protocol.coverage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* <div className="space-y-2">
                <Label>Protocol Network</Label>
                <Input type="text" placeholder="Choose blockchain" />
              </div> */}

              <div className="space-y-2">
                <Label>Insurance Amount (USDC)</Label>
                <Input type="number" placeholder="Enter amount" />
              </div>

              <div className="space-y-2">
                <Label>Coverage Period</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Purchase Insurance <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Insurance Policies</CardTitle>
              <CardDescription>
                View and manage your active coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeInsurance.map((policy) => (
                <div key={policy.id} className="mb-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{policy.protocol}</h3>
                      <p className="text-sm text-gray-500">
                        Coverage: {policy.coverage}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      <ShieldCheck className="mr-1 h-4 w-4" />
                      {policy.status}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <p>Insured Amount: {policy.amount}</p>
                    <p>
                      Valid: {policy.startDate} to {policy.endDate}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claim">
          <Card>
            <CardHeader>
              <CardTitle>File an Insurance Claim</CardTitle>
              <CardDescription>
                Submit a claim if you've experienced a covered incident
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important Notice</AlertTitle>
                <AlertDescription>
                  Please ensure you have evidence of the smart contract hack or
                  vulnerability before filing a claim. False claims will be
                  rejected.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Select Affected Policy</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeInsurance.map((policy) => (
                      <SelectItem key={policy.id} value={policy.id.toString()}>
                        {policy.protocol} - {policy.coverage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Incident Description</Label>
                <textarea
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  placeholder="Describe what happened..."
                />
              </div>

              <div className="space-y-2">
                <Label>Transaction Hash</Label>
                <Input placeholder="Enter transaction hash of the incident" />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() =>
                  verifyTransaction(
                    // `0x6021b7bf7dc89bd192893e4c6b1decba735584a800dc4614b8d49cf403095010`
                    `0x752539a44af1c7f8cb1821fc7ad99ba0621237ca7568260786909f0c96068f03`
                  )
                }
              >
                Submit Claim
              </Button>
              {/* <Button className="w-full">Enter Claim</Button> */}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsuranceDashboard;
