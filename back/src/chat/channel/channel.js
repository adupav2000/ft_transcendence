"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.Channel = void 0;
var channel_type_1 = require("../types/channel.type");
var Channel = /** @class */ (function () {
    function Channel(server, id) {
        this.server = server;
        this.id = id;
        this.mode = channel_type_1.ChannelModes.Public;
        this.owner = "";
        this.clients = new Map();
    }
    Channel.prototype.addClient = function (username, roomId) {
        this.clients.set(username, roomId);
    };
    Channel.prototype.removeClient = function (clientId) {
        this.clients["delete"](clientId);
    };
    Channel.prototype.clientsId = function () {
        var clientsIdArray = [];
        this.clients.forEach(function (client, id) {
            clientsIdArray.push(id);
        });
        return clientsIdArray;
    };
    Channel.prototype.getInfo = function (clients) {
        var res = {
            channelId: this.id,
            clients: clients,
            mode: this.mode,
            nbClients: this.getNbClients(),
            owner: this.owner
        };
        return res;
    };
    Channel.prototype.changeMode = function (newChannelMode) {
        this.mode = newChannelMode;
        this.sendToUsers("channelModeChanged", { channelName: this.id, mode: newChannelMode });
    };
    Channel.prototype.sendToClient = function (clientId, event, data) {
        var roomId = this.clients.get(clientId);
        if (!roomId)
            return;
        this.server.to(roomId).emit(event, data);
    };
    Channel.prototype.sendToUsers = function (event, data, exclude) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.clients.forEach(function (roomId, client) {
                    if (roomId != null && roomId != exclude)
                        _this.server.to(roomId).emit(event, data);
                });
                return [2 /*return*/];
            });
        });
    };
    Channel.prototype.updateClient = function (username, roomId) { this.clients.set(username, roomId); };
    Channel.prototype.isClient = function (clientId) { return this.clients.has(clientId); };
    Channel.prototype.isPublic = function () { return this.mode == channel_type_1.ChannelModes.Public; };
    Channel.prototype.isPrivate = function () { return this.mode == channel_type_1.ChannelModes.Private; };
    Channel.prototype.isPasswordProtected = function () { return this.mode == channel_type_1.ChannelModes.Password; };
    Channel.prototype.sendMessage = function (msg) { this.server.to(this.id).emit("msgToChannel", msg); };
    Channel.prototype.getClientRoomId = function (clientId) { return this.clients.get(clientId); };
    Channel.prototype.getNbClients = function () { return this.clients.size; };
    return Channel;
}());
exports.Channel = Channel;
