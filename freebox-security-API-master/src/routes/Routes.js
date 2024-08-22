let Controller = require('../controllers/Controller')

// Routes
module.exports = function() {
    this.router = require('express').Router()
    this.controller = new Controller()
    this.polling = false
    
    this.init = function(port) {
        this.port = port
        this.initRoutes(this)
    }

    this.startPollingNodes = function() {
        this.polling = true
        this.controller.init()
    }

    this.startFreeboxAuthentication = function(callback) {
        this.controller.startFreeboxAuthentication((success) => {
            if (success && (this.polling == false)) {
                this.startPollingNodes()
            }
            callback(success)
        })
    }

    this.requestNewFreeboxAuthentication = function(callback) {
        this.controller.handleAuth(null, (success) => {
            if (success && (this.polling == false)) {
                this.startPollingNodes()
            }
            callback(success)
        })
    }

    this.checkUnauthorizedRequest = function(req, res) {
        if (req.headers.host != 'localhost:'+this.port) {
            return res.status(401).send('unauthorized')
        }
    }

    this.initRoutes = function(self) {
        self.router.get('/ping', function(req, res) {
            self.controller.handlePing(res)
        })
        self.router.get('/fbx/rights', function(req, res) {
            self.controller.handleCheckRights(res)
        })
        self.router.get('/fbx/auth', function(req, res) {
            self.controller.handleAuth(res, (success) => {
                if (success && (self.polling == false)) {
                    self.startPollingNodes()
                }
            })
        })
        self.router.get('/refresh/:timeout', function(req, res) {
            let timeout = parseInt(req.params.timeout, 10)
            self.controller.handleTimeoutUpdate(timeout, res)
        })
        self.router.get('/node/list', function(req, res) {
            self.checkUnauthorizedRequest(req, res)
            self.controller.handleNodeList(res)
        })
        self.router.get('/node/:id', function(req, res) {
            self.checkUnauthorizedRequest(req, res)
            let nodeId = parseInt(req.params.id, 10)
            self.controller.handleNodeStatus(nodeId, res)
        })
        self.router.get('/alarm/main', function(req, res) {
            self.checkUnauthorizedRequest(req, res)
            self.controller.handleAlarmMain(res)
        })
        self.router.get('/alarm/secondary', function(req, res) {
            self.checkUnauthorizedRequest(req, res)
            self.controller.handleAlarmSecondary(res)
        })
        self.router.get('/alarm/off', function(req, res) {
            self.checkUnauthorizedRequest(req, res)
            self.controller.handleAlarmOff(res)
        })
        self.router.get('/alarm/target', function(req, res) {
            self.checkUnauthorizedRequest(req, res)
            self.controller.handleAlarmTarget(res)
        })
        self.router.get('/alarm/state', function(req, res) {
            self.checkUnauthorizedRequest(req, res)
            self.controller.handleAlarmState(res)
        })
    }
}
