import os from "os";

function getLANIPs() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) ips.push({ name, address: net.address });
    }
  }
  return ips;
}

console.log("LAN IPv4 addresses:");
for (const x of getLANIPs()) console.log(`- ${x.address} (${x.name})`);
