# TODO: Fix Chat 404 Error and Socket Issues

## Steps to Complete
- [x] Change backend port from 80 to 5000 in server.js to match frontend axios baseURL
- [x] Add missing user chat routes in chatRoutes.js (/user/:userId and /user/:userId/message) - Routes were already present
- [x] Update socket event handling in server.js to handle 'joinBooking' and 'joinUserChat' events
- [ ] Test the fixes by running backend and frontend servers
