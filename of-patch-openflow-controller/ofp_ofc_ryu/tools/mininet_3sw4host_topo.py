#
# usage
#   sudo python mininet_3sw4host_topo.py
#
from mininet.cli import CLI
from mininet.topo import Topo
from mininet.net import Mininet
from mininet.link import Link
from mininet.node import RemoteController,OVSKernelSwitch
from mininet.util import dumpNodeConnections
from mininet.log import setLogLevel

spine1_name = 'spine1'
leaf1_name = 'leaf1'
leaf2_name = 'leaf2'
host1_name = 'host1'
host2_name = 'host2'
host3_name = 'host3'
host4_name = 'host4'

host1_ip = '10.0.80.1/24'
host2_ip = '10.0.80.2/24'
host3_ip = '10.0.80.3/24'
host4_ip = '10.0.80.4/24'

spine1_dpid = '0000001432086945'
leaf1_dpid  = '0000d6611643814c'
leaf2_dpid  = '0000463203ebe642'

ofc_ip = '127.0.0.1'
ofc_port = 6641
ofp_ver_str = 'OpenFlow13'

def ofp_version(switch, protocols):
    protocols_str = ','.join(protocols)
    command = 'ovs-vsctl set Bridge %s protocols=%s' % (switch,protocols_str)
    switch.cmd(command)

def myTopo():
    net = Mininet(switch=OVSKernelSwitch)
    net.addController('controller01',controller=RemoteController,ip=ofc_ip, port=ofc_port)

    spine1 = net.addSwitch(spine1_name, dpid=spine1_dpid)
    leaf1  = net.addSwitch(leaf1_name,  dpid=leaf1_dpid)
    leaf2  = net.addSwitch(leaf2_name,  dpid=leaf2_dpid)

    host1 = net.addHost(host1_name, ip=host1_ip)
    host2 = net.addHost(host2_name, ip=host2_ip)
    host3 = net.addHost(host3_name, ip=host3_ip)
    host4 = net.addHost(host4_name, ip=host4_ip)

    net.addLink(spine1, leaf1)
    net.addLink(spine1, leaf2)

    net.addLink(leaf1, host1)
    net.addLink(leaf1, host2)

    net.addLink(leaf2, host3)
    net.addLink(leaf2, host4)

    net.start()
    print "Dumping node connections"
    dumpNodeConnections(net.switches)
    dumpNodeConnections(net.hosts)

    ofp_version(spine1, ['OpenFlow13'])
    ofp_version(leaf1,  ['OpenFlow13'])
    ofp_version(leaf2,  ['OpenFlow13'])

    CLI(net)
    net.stop()

if __name__ == '__main__':
    setLogLevel('info')
    myTopo()

