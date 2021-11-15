# abstract

Problem:  how do to two users find each other in a randomly connected p2p network, where each user is connected to some small number of randome peers?  

This is a problem of addressing.  

In a random p2p network there needs to be at least two addresses, or two parts to a single address.  One is a unique, random ID, such as the hash of a public key.  The other is the point in time when the peer connected to the network.  

New users are connected to a number of "random" peers in the network which "reside" nearby in time.

Each peer maps out a mesh of nth degree paths through its connected peers, across its plane of spacetime.  Naturally, or randomly, most connectons will be either be slightly forward or backward in time.  In addition to mapping out a mesh of paths across parallel time, nexuses into perpendicular spacetime will be revealed, which may be useful for sending out messages. 

Two users in random p2p network want to connect via relays.  They must first find each other.  They each have a public address, which is their unique ID + their timestamp.  User A gives User B that address, the same as with email or phone numbers.  User B then sends a message with that address to all of its peers in that direction of time (or any direction...).  

Every peer's job is to relay messages in the temporal direction of the address, until the message is caught in the mesh of paths around the recipient's spacetime, whereupon is may be forwarded via known paths directly to its final destination.  The message will always be forwarded in the correct direction, altho it could get bounced away in time if it doesn't "get caught" after some interval; or it could be deleted, or returned to the sender.  

Also, perhaps, Peer B's message was sent redundantly via multiple channels.  For instance, User B sends a message to Peer Q in the direction of time User A resides.  Peer Q, knowing it is the first degree relay, forwards it to two peers.  Each peer up to some degree removed from the origin (halfway toward the timesapce address?) also forwards it to two peers, or nth degree squared peers, or some fibancci shit. 

## peripheral considerations

One thing not addressed here is the initial connection.  Given webRTC, it seems plausible that a peer would connect to its first peer using manual methods, such as passing the actual signal hash over another network.  Another option is to use something like a bittorrent tracker or signal server, which is tuned to connect peers together which connected close to each other in time.  The goal is to get the peer connected to neighbors in spacetime.  
