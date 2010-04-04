/*
    Copyright 2010 Jamie Love

    This file is part of the "R-Node Server".

    R-Node Server is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 2.1 of the License, or
    (at your option) any later version.

    R-Node Server is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with R-Node Server.  If not, see <http://www.gnu.org/licenses/>.
*/
#include <vector>
#include <unistd.h>

// Node stuff
#include <node.h>
#include <node_events.h>
#include <assert.h>

// Rserve stuff
#define MAIN // we are the main program, we need to define this for Rserve
#define SOCK_ERRORS

#include "sisocks.h"
#include "Rconnection.h"

using namespace v8;
using namespace node;
static Persistent<String> result_symbol;
static Persistent<String> close_symbol;
static Persistent<String> connect_symbol;
static Persistent<String> login_symbol;
static Persistent<String> command_sent_symbol;
#define STATE_SYMBOL String::NewSymbol("state")

char *getErrorMsg (char code) {
    static char buf[200];
#ifdef DEBUG_CXX
    printf("Code:  %d\n", code);
#endif
    switch (code) {
        case ERR_unknownCmd:
        case ERR_inv_cmd:
            snprintf (buf, 200, "Error 0x%X: object not found", code);
            break;
        case ERR_inv_par:
            snprintf (buf, 200, "Error 0x%X: invalid parameter", code);
            break;
        case ERR_unsupportedCmd:
            snprintf (buf, 200, "Error 0x%X: command not supported", code);
            break;
        default:
            snprintf (buf, 200, "Error 0x%X: unknown error code", code);
    }
    return buf;
}

void dumpChars (char *d, int len) {
#ifdef DEBUG_CXX
    int i = 0;
    while (i < len) {
        printf ("%02x ", (int) d[i]);
        ++i;
    }
    printf("\n");
#endif
}

// Taken from java code.
int getRexpLen (char *buf, int o) {
    int len = ((buf[o]&64)>0) ? // "long" format; still - we support 32-bit only
        ((buf[o+1]&255)|((buf[o+2]&255)<<8)|((buf[o+3]&255)<<16)|((buf[o+4]&255)<<24))
        :
        ((buf[o+1]&255)|((buf[o+2]&255)<<8)|((buf[o+3]&255)<<16));
    return len;
}

Local<Value> parseRexp (char *data, int &startAt) {
    HandleScope scope;

    Local<Value> retval = Local<Value>::New(Null());
    Local<Value> err = Exception::Error(String::New("Parse exception"));
    
    if (!data)
        return scope.Close(err);

    int len = getRexpLen (data, startAt);
    bool hasAttribute = ((data[startAt]&128)!=0);
    bool isLong = ((data[startAt]&64)!=0);
    int type = (int)(data[startAt]&63); 


    if (isLong) 
        startAt += 4;
    startAt += 4;
    int eox=startAt + len;

    bool isTags = false;

    Local<Value> attributes = Local<Value>::New(Null());
    if (hasAttribute)  {
        isTags = type == XT_LIST_TAG;
        attributes = parseRexp (data, startAt); 
    }

#ifdef DEBUG_CXX
    fprintf(stderr, "parseRexp: type=%d, len=%d, hasAtt=%d, isLong=%d\n", type, len, hasAttribute, isLong);
#endif

    // TODO - types: 16

    if (type == XT_NULL) {
        startAt = eox;
        retval = Local<Value>::New(Null());
    }
    else if (type == XT_ARRAY_DOUBLE) {
        int totalValues = (eox-startAt)/8;
        int i = 0;
        Local<Array> a = Array::New(totalValues);
        while (startAt<eox) {
            a->Set(Integer::New(i), Number::New (*((double *) (&data[startAt]))));
            startAt += 8;
            i++;
        };
        if (startAt!=eox) {
            printf("Warning: double array SEXP size mismatch\n");
        };
        retval = a;
    }
    else if (type == XT_ARRAY_BOOL) {
        int totalValues = *((int32_t *)&data[startAt]);
        startAt += 4;
        int i = 0;
        Local<Array> a = Array::New(totalValues);
        while (i < totalValues) {
            a->Set(Integer::New(i), Boolean::New (data[startAt] != 0));
            startAt ++;
            i++;
        };
        if (startAt!=eox) {
            printf("Warning: bool array SEXP size mismatch\n");
        };
        retval = a;
    }
    else if (type == XT_ARRAY_INT) {
        int totalValues = (eox-startAt)/4;
        int i = 0;
        Local<Array> a = Array::New(totalValues);
        while (startAt<eox) {
            a->Set(Integer::New(i), Integer::New (*((int32_t *) (&data[startAt]))));
            startAt += 4;
            i++;
        };
        if (startAt!=eox) {
            printf("Warning: int array SEXP size mismatch\n");
        };
        retval = a;
    }
    else if (type==XT_STR||type==XT_SYMNAME) {
        retval = String::New (data + startAt); // TODO Deal with encoding.
    }
    else if (type == XT_ARRAY_STR) {
        int i = 0;
        int count = 0;
        while (startAt + i < eox) {
            if (data[startAt + i] == 0) count++;
            i++;
            if (data[startAt] == 1) break;
        }
        Local<Array> a = Array::New(count);
        if (count > 0) {
            i = 0;
            while (startAt<eox && i < count) {
                char *s = data + startAt;
                a->Set(Integer::New(i), String::New (s));

                while (data[++startAt] != 0 && startAt < eox) ;
                ++startAt;

                if (data[startAt] == 1) break;
                ++i;
            };
        }
        retval = a;
    }
    else if (type==XT_LIST_NOTAG || type==XT_LIST_TAG) {
        Local<Object> a = Object::New();
        while (startAt < eox) {
            Local<Value> values = parseRexp(data, startAt);
            Local<Value> tag = Local<Value>::New(Null());
            if (type==XT_LIST_TAG) {
                tag = parseRexp(data, startAt);
            }
            if (!tag->IsNull()) { // TODO Deal with null
                a->Set (tag, values);
            }
        }

        if (startAt != eox) {
            printf("Warning: int list SEXP size mismatch\n");
        }
        retval = a;
    }

    if (type==XT_VECTOR) {
        std::vector <Local<Value> > v;
        while (startAt < eox) {
            Local<Value> r = parseRexp(data, startAt);
            v.push_back (r);
        };
        if (startAt!=eox) {
            printf("Warning: int vector SEXP size mismatch\n");
            startAt =eox;
        };

        Local<Array> a = Array::New(v.size());
        std::vector<Local<Value> >::iterator i = v.begin();
        int c = 0;
        while (i != v.end()) {
            a->Set (Integer::New(c), *i);
            ++i;
            ++c;
        }

        retval = a;
        
        // fixup for lists since they're stored as attributes of vectors
        /*if (x.getAttribute("names")!=null) {
            REXP nam=x.getAttribute("names");
            RList l = new RList(v, nam.asStringArray());
            x.cont=l;
        }; TODO */
    };

    if (!attributes->IsNull()) {
        Local<Object> a = Object::New();
        a->Set (String::New("values"), retval);
        a->Set (String::New("attributes"), attributes);

        retval = a;
    }

    startAt = eox;
    return scope.Close(retval);
}

class Connection : public EventEmitter {
    private:

        ev_io read_watcher_;
        ev_io write_watcher_;

        Rconnection *connection_;

        Rmessage *resultMessage;
        Rmessage *currentMessageCommand;

        static const int STATE_UNCONNECTED = 0;
        static const int STATE_CONNECTING = 1;
        static const int STATE_IDLE = 2;
        static const int STATE_SENDING_COMMAND = 3;
        static const int STATE_AWAITING_COMMAND_RESPONSE = 4;
        static const int STATE_RECEIVING_COMMAND = 5;
        static const int STATE_CLOSING = 6;
        static const int STATE_LOGGING_IN = 7;

        int state;

    public:
        /**
         * Initialise the node interface side of things.
         */
        static void Initialize (v8::Handle<v8::Object> target) {
            HandleScope scope;

            Local<FunctionTemplate> t = FunctionTemplate::New(New);

            t->Inherit(EventEmitter::constructor_template);
            t->InstanceTemplate()->SetInternalFieldCount(1);

            close_symbol = NODE_PSYMBOL("close");
            connect_symbol = NODE_PSYMBOL("connect");
            login_symbol = NODE_PSYMBOL("login");
            result_symbol = NODE_PSYMBOL("result");
            command_sent_symbol = NODE_PSYMBOL("commandsent");

            NODE_SET_PROTOTYPE_METHOD(t, "connect", Connect);
            NODE_SET_PROTOTYPE_METHOD(t, "close", Close);
            NODE_SET_PROTOTYPE_METHOD(t, "query", Query);
            NODE_SET_PROTOTYPE_METHOD(t, "login", Login);

            t->PrototypeTemplate()->SetAccessor(STATE_SYMBOL, StateGetter);

            target->Set(String::NewSymbol("Connection"), t->GetFunction());

            initsocks(); // sisock for windows.
        }

        /**
         * Connect to Rserve.
         */
        bool Connect (const char *host, uint32_t port) {
            if (connection_) return false;

            connection_ = new Rconnection();
            int i = connection_->connect();

            if (i) {
                connection_ = NULL;
                return false;
            }

            state = STATE_CONNECTING;

            int fd = connection_->getSocket();

            ev_io_set(&read_watcher_, fd, EV_READ);
            ev_io_set(&write_watcher_, fd, EV_WRITE);

            ev_io_start(EV_DEFAULT_ &read_watcher_);
            ev_io_start(EV_DEFAULT_ &write_watcher_);

            Ref(); // ??

            return true;
        }

        void Close (Local<Value> exception = Local<Value>()) {
            HandleScope scope;
            ev_io_stop(EV_DEFAULT_ &write_watcher_);
            ev_io_stop(EV_DEFAULT_ &read_watcher_);
            delete(connection_);
            connection_ = NULL;
            if (exception.IsEmpty()) {
                Emit(close_symbol, 0, NULL);
            } else {
                Emit(close_symbol, 1, &exception);
            }
            Unref(); // ??
        }

        bool Login (const char *user, const char *pwd) {

            if (state != STATE_IDLE) {
                return false;
            }

            resultMessage = new Rmessage ();

            char *authbuf=(char*) malloc(strlen(user)+strlen(pwd)+22);
            char *c;
            strcpy(authbuf, user); c=authbuf+strlen(user);
            *c='\n'; c++;
            strcpy(c,pwd);
            strcpy(c,crypt(pwd,connection_->getSalt())); // TODO deal with plaintext

            currentMessageCommand = new Rmessage (CMD_login, authbuf);
            int r = currentMessageCommand->send (connection_->getSocket());

            free (authbuf);
            if (r) {
                return false;
            }

            if (!currentMessageCommand->sendComplete()) {
                ev_io_start(&write_watcher_);
            } else {
                state = STATE_LOGGING_IN;
                ev_io_stop(EV_DEFAULT_ &write_watcher_);
                ev_io_start(EV_DEFAULT_ &read_watcher_); // now wait for the response
            }

            return true;
        }

        bool Query (const char *command) {

            if (state != STATE_IDLE) {
                return false;
            }

            resultMessage = new Rmessage ();
            currentMessageCommand = new Rmessage (CMD_eval, command);
            
            int r = currentMessageCommand->send (connection_->getSocket());

            if (r) {
                return false;
            }

            if (!currentMessageCommand->sendComplete()) {
                ev_io_start(&write_watcher_);
            } else {
                state = STATE_AWAITING_COMMAND_RESPONSE;
                Emit(command_sent_symbol, 0, NULL);
                ev_io_stop(EV_DEFAULT_ &write_watcher_);
                ev_io_start(EV_DEFAULT_ &read_watcher_); // now wait for the response
            }

            return true;
        }

    protected:

        /**
         * Creates a new Rserve connection for javascript.
         */
        static Handle<Value> New (const Arguments& args) {
            HandleScope scope;

            Connection *connection = new Connection();
            connection->Wrap(args.This());

            return args.This();
        }

        /**
         * This is the 'connect' method of the Rserve connection
         * object
         */
        static Handle<Value> Connect (const Arguments& args) {
            Connection *connection = ObjectWrap::Unwrap<Connection>(args.This());

            HandleScope scope;

            if (args.Length() != 2 || !args[0]->IsString() || !args[1]->IsInt32()) {
                return ThrowException(Exception::Error(String::New("Must give host and port as arguments 1 and 2.")));
            }

            String::Utf8Value host(args[0]->ToString());
            uint32_t port = args[1]->Uint32Value();
            bool r = connection->Connect(*host, port);

            if (!r) { // If we didn't connect - use errno for now.
                return ThrowException(Exception::Error(String::New(strerror(errno))));
            }

            return Undefined();
        }

        /**
         * This is the 'close' method of the Rserve connection
         * object.
         */
        static Handle<Value> Close (const Arguments& args) {
            Connection *connection = ObjectWrap::Unwrap<Connection>(args.This());
            HandleScope scope;
            connection->Close();
            return Undefined();
        }

        static Handle<Value> Login (const Arguments& args) {
            Connection *connection = ObjectWrap::Unwrap<Connection>(args.This());
            HandleScope scope;

            if (args.Length() != 2 || !args[0]->IsString() || !args[1]->IsString()) {
                return ThrowException(Exception::TypeError(String::New("Arguments must be: username, password")));
            }

            String::Utf8Value user(args[0]->ToString());
            String::Utf8Value pass(args[1]->ToString());
            bool r = connection->Login(*user, *pass);

            if (!r) {
                return ThrowException(Exception::Error(String::New("Cannot login.")));
            }

            return Undefined();
        }

        static Handle<Value> Query (const Arguments& args) {
            Connection *connection = ObjectWrap::Unwrap<Connection>(args.This());
            HandleScope scope;

            if (args.Length() == 0 || !args[0]->IsString()) {
                return ThrowException(Exception::TypeError(String::New("First argument must be a string")));
            }

            String::Utf8Value query(args[0]->ToString());
            bool r = connection->Query(*query);

            if (!r) {
                return ThrowException(Exception::Error(String::New("Cannot send query ... TODO")));
            }

            return Undefined();
        }

        static Handle<Value> StateGetter (Local<String> property, const AccessorInfo& info) {
            Connection *connection = ObjectWrap::Unwrap<Connection>(info.This());
            assert(connection);
            assert(property == STATE_SYMBOL);

            HandleScope scope;

            const char *s;

            switch (connection->state) {
                case STATE_UNCONNECTED: 
                    s = "unconnected";
                    break;
                case STATE_SENDING_COMMAND: 
                case STATE_RECEIVING_COMMAND: 
                case STATE_AWAITING_COMMAND_RESPONSE:
                    s = "busy";
                    break;
                case STATE_IDLE:
                    s = "idle";
                    break;
                case STATE_CONNECTING:
                    s = "connecting";
                    break;
                case STATE_CLOSING:
                    s = "unconnected";
                    break;
                case STATE_LOGGING_IN:
                    s = "logging in";
                    break;
            }

            return scope.Close(String::NewSymbol(s));
        }

        Connection () : EventEmitter () {
            connection_ = NULL;
            state = STATE_UNCONNECTED;

            ev_init(&read_watcher_, io_event);
            read_watcher_.data = this;

            ev_init(&write_watcher_, io_event);
            write_watcher_.data = this;
        }

        ~Connection () {
            assert(connection_ == NULL);
        }

    private:
        void MakeConnection () {
            HandleScope scope;

            int i = connection_->pollConnection();
            if (i) {
                CloseConnectionWithError(strerror(errno));
                return;
            }

            if (connection_->connected()) {
                state = STATE_IDLE;
                Local<Value> needLogin = scope.Close(Boolean::New (connection_->needsLogin()));
                Emit(connect_symbol, 1, &needLogin);
                ev_io_stop(EV_DEFAULT_ &write_watcher_);
                ev_io_start(EV_DEFAULT_ &read_watcher_);
            }
        }

        void CloseConnectionWithError (const char *message_s = NULL) {
            HandleScope scope;

            Local<String> message = String::New(message_s);
            Local<Value> exception = Exception::Error(message);

            Close(exception);
        }

        /**
         * Deal with our IO socket management telling us we got some data.
         */
        void Event (int revents) {
            HandleScope scope;

            if (revents & EV_ERROR) {
                CloseConnectionWithError("connection closed");
                return;
            }

            if (revents & EV_READ) {
                if (state == STATE_CONNECTING) {
                    MakeConnection();
                    return;
                }
                if (state == STATE_AWAITING_COMMAND_RESPONSE || state == STATE_RECEIVING_COMMAND) {
                    state = STATE_RECEIVING_COMMAND;
                    int i= resultMessage->read(connection_->getSocket());
                    if (i) {
                        CloseConnectionWithError(strerror(errno));
                        return;
                    }
                    if (resultMessage->receiveComplete()) {
                        state = STATE_IDLE;
                        ev_io_stop(EV_DEFAULT_ &read_watcher_); 
                        
                        int startPoint = 0;
                        // TODO deal with multiple pars! and different par types.
                        Local<Value> result;
                        if (resultMessage->pars > 0) { // TEST proper response code
                            if (PAR_TYPE(*resultMessage->par[0]) == DT_SEXP)
                                result = parseRexp (((char *)resultMessage->par[0]) + 4, startPoint);
                        } else {
                            Local<String> message = String::New(getErrorMsg(CMD_STAT(resultMessage->head.cmd)));
                            result = Exception::Error(message);
                        }

#ifdef DEBUG_CXX
                        printf ("COMMAND: %d\n", resultMessage->head.cmd);
#endif
                        dumpChars ((char *)&resultMessage->head,  16);

                        Emit(result_symbol, 1, &result);
                    }
                }
                if (state == STATE_LOGGING_IN) {
                    int i= resultMessage->read(connection_->getSocket());
                    if (i) {
                        CloseConnectionWithError(strerror(errno));
                        return;
                    }
                    if (resultMessage->receiveComplete()) {
                        state = STATE_IDLE;
                        ev_io_stop(EV_DEFAULT_ &read_watcher_); 

                        Local<Value> success = scope.Close(Boolean::New (resultMessage->command() == RESP_OK));
                        Emit(login_symbol, 1, &success);
                    }
                }
            }

            if (revents & EV_WRITE) {
                // Should be sending ...
                if (state == STATE_SENDING_COMMAND) {
                    int r = currentMessageCommand->send (connection_->getSocket());
                    if (r)
                        CloseConnectionWithError("bla bla bla!!");

                    if (!currentMessageCommand->sendComplete()) {
                        state = STATE_AWAITING_COMMAND_RESPONSE;
                        Emit(command_sent_symbol, 0, NULL);
                        ev_io_stop(EV_DEFAULT_ &write_watcher_);
                        ev_io_start(EV_DEFAULT_ &read_watcher_); // now wait for the response
                    }
                }
            }
        }

        static void io_event (EV_P_ ev_io *w, int revents) {
            Connection *connection = static_cast<Connection*>(w->data);
            connection->Event(revents);
        }
};

/**
 * The Nodejs interface
 */
extern "C" void
init (Handle<Object> target) {
    HandleScope scope;
    Connection::Initialize(target);
}
