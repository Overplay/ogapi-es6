#NOTES


##App, Venue, System, Device Messages

App Messages are tested and working. They send messages to all subscribed clients for a particular app on a particular device. The room ID is calculated like this:
`const roomId = _appId + ':' + _deviceUDID;`

System Messages are subscribed to, but there is no endpoint to send them from outside the server right now. System messages are things like channel changes, moves, etc. that the JS might want to know about.
The Device and Venue subscribe and listen are unimplemented right now.


| Type          | Room               | Msg               | Comment   
| ------------- |:------------------:| -----------------:|---------------------------------------
| App-Device    | `appid:deviceId`   |  `appid:deviceId` | For all clients on a particular device for  specific app
| col 2 is      | centered           |   $12             |
| zebra stripes | are neat           |    $1             |
