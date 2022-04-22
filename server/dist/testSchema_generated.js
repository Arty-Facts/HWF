"use strict";
// automatically generated by the FlatBuffers compiler, do not modify
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
/**
 * @enum {number}
 */
var schema;
(function (schema) {
    let MessageBody;
    (function (MessageBody) {
        MessageBody[MessageBody["NONE"] = 0] = "NONE";
        MessageBody[MessageBody["Task"] = 1] = "Task";
        MessageBody[MessageBody["GetResult"] = 2] = "GetResult";
        MessageBody[MessageBody["GetHardwarePool"] = 3] = "GetHardwarePool";
        MessageBody[MessageBody["File"] = 4] = "File";
    })(MessageBody = schema.MessageBody || (schema.MessageBody = {}));
})(schema = exports.schema || (exports.schema = {}));
;
/**
 * @constructor
 */
(function (schema) {
    class Message {
        constructor() {
            this.bb = null;
            this.bb_pos = 0;
        }
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns Message
         */
        __init(i, bb) {
            this.bb_pos = i;
            this.bb = bb;
            return this;
        }
        ;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param Message= obj
         * @returns Message
         */
        static getRootAsMessage(bb, obj) {
            return (obj || new Message).__init(bb.readInt32(bb.position()) + bb.position(), bb);
        }
        ;
        /**
         * @returns number
         */
        type() {
            var offset = this.bb.__offset(this.bb_pos, 4);
            return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
        }
        ;
        /**
         * @returns schema.MessageBody
         */
        bodyType() {
            var offset = this.bb.__offset(this.bb_pos, 6);
            return offset ? /**  */ (this.bb.readUint8(this.bb_pos + offset)) : schema.MessageBody.NONE;
        }
        ;
        /**
         * @param flatbuffers.Table obj
         * @returns ?flatbuffers.Table
         */
        body(obj) {
            var offset = this.bb.__offset(this.bb_pos, 8);
            return offset ? this.bb.__union(obj, this.bb_pos + offset) : null;
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         */
        static startMessage(builder) {
            builder.startObject(3);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param number type
         */
        static addType(builder, type) {
            builder.addFieldInt32(0, type, 0);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param schema.MessageBody bodyType
         */
        static addBodyType(builder, bodyType) {
            builder.addFieldInt8(1, bodyType, schema.MessageBody.NONE);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset bodyOffset
         */
        static addBody(builder, bodyOffset) {
            builder.addFieldOffset(2, bodyOffset, 0);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endMessage(builder) {
            var offset = builder.endObject();
            return offset;
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset offset
         */
        static finishMessageBuffer(builder, offset) {
            builder.finish(offset);
        }
        ;
        static createMessage(builder, type, bodyType, bodyOffset) {
            Message.startMessage(builder);
            Message.addType(builder, type);
            Message.addBodyType(builder, bodyType);
            Message.addBody(builder, bodyOffset);
            return Message.endMessage(builder);
        }
    }
    schema.Message = Message;
})(schema = exports.schema || (exports.schema = {}));
/**
 * @constructor
 */
(function (schema) {
    class Stage {
        constructor() {
            this.bb = null;
            this.bb_pos = 0;
        }
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns Stage
         */
        __init(i, bb) {
            this.bb_pos = i;
            this.bb = bb;
            return this;
        }
        ;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param Stage= obj
         * @returns Stage
         */
        static getRootAsStage(bb, obj) {
            return (obj || new Stage).__init(bb.readInt32(bb.position()) + bb.position(), bb);
        }
        ;
        name(optionalEncoding) {
            var offset = this.bb.__offset(this.bb_pos, 4);
            return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
        }
        ;
        /**
         * @param number index
         * @returns number
         */
        data(index) {
            var offset = this.bb.__offset(this.bb_pos, 6);
            return offset ? this.bb.readInt8(this.bb.__vector(this.bb_pos + offset) + index) : 0;
        }
        ;
        /**
         * @returns number
         */
        dataLength() {
            var offset = this.bb.__offset(this.bb_pos, 6);
            return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
        }
        ;
        /**
         * @returns Int8Array
         */
        dataArray() {
            var offset = this.bb.__offset(this.bb_pos, 6);
            return offset ? new Int8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
        }
        ;
        cmdList(index, optionalEncoding) {
            var offset = this.bb.__offset(this.bb_pos, 8);
            return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
        }
        ;
        /**
         * @returns number
         */
        cmdListLength() {
            var offset = this.bb.__offset(this.bb_pos, 8);
            return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
        }
        ;
        /**
         * @returns boolean
         */
        trackTime() {
            var offset = this.bb.__offset(this.bb_pos, 10);
            return offset ? !!this.bb.readInt8(this.bb_pos + offset) : true;
        }
        ;
        /**
         * @returns boolean
         */
        trackRam() {
            var offset = this.bb.__offset(this.bb_pos, 12);
            return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
        }
        ;
        /**
         * @returns boolean
         */
        trackCpu() {
            var offset = this.bb.__offset(this.bb_pos, 14);
            return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
        }
        ;
        /**
         * @returns boolean
         */
        trackGpu() {
            var offset = this.bb.__offset(this.bb_pos, 16);
            return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
        }
        ;
        comment(optionalEncoding) {
            var offset = this.bb.__offset(this.bb_pos, 18);
            return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         */
        static startStage(builder) {
            builder.startObject(8);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset nameOffset
         */
        static addName(builder, nameOffset) {
            builder.addFieldOffset(0, nameOffset, 0);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset dataOffset
         */
        static addData(builder, dataOffset) {
            builder.addFieldOffset(1, dataOffset, 0);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<number> data
         * @returns flatbuffers.Offset
         */
        static createDataVector(builder, data) {
            builder.startVector(1, data.length, 1);
            for (var i = data.length - 1; i >= 0; i--) {
                builder.addInt8(data[i]);
            }
            return builder.endVector();
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startDataVector(builder, numElems) {
            builder.startVector(1, numElems, 1);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset cmdListOffset
         */
        static addCmdList(builder, cmdListOffset) {
            builder.addFieldOffset(2, cmdListOffset, 0);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createCmdListVector(builder, data) {
            builder.startVector(4, data.length, 4);
            for (var i = data.length - 1; i >= 0; i--) {
                builder.addOffset(data[i]);
            }
            return builder.endVector();
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startCmdListVector(builder, numElems) {
            builder.startVector(4, numElems, 4);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param boolean trackTime
         */
        static addTrackTime(builder, trackTime) {
            builder.addFieldInt8(3, +trackTime, +true);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param boolean trackRam
         */
        static addTrackRam(builder, trackRam) {
            builder.addFieldInt8(4, +trackRam, +false);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param boolean trackCpu
         */
        static addTrackCpu(builder, trackCpu) {
            builder.addFieldInt8(5, +trackCpu, +false);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param boolean trackGpu
         */
        static addTrackGpu(builder, trackGpu) {
            builder.addFieldInt8(6, +trackGpu, +false);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset commentOffset
         */
        static addComment(builder, commentOffset) {
            builder.addFieldOffset(7, commentOffset, 0);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endStage(builder) {
            var offset = builder.endObject();
            return offset;
        }
        ;
        static createStage(builder, nameOffset, dataOffset, cmdListOffset, trackTime, trackRam, trackCpu, trackGpu, commentOffset) {
            Stage.startStage(builder);
            Stage.addName(builder, nameOffset);
            Stage.addData(builder, dataOffset);
            Stage.addCmdList(builder, cmdListOffset);
            Stage.addTrackTime(builder, trackTime);
            Stage.addTrackRam(builder, trackRam);
            Stage.addTrackCpu(builder, trackCpu);
            Stage.addTrackGpu(builder, trackGpu);
            Stage.addComment(builder, commentOffset);
            return Stage.endStage(builder);
        }
    }
    schema.Stage = Stage;
})(schema = exports.schema || (exports.schema = {}));
/**
 * @constructor
 */
(function (schema) {
    class Task {
        constructor() {
            this.bb = null;
            this.bb_pos = 0;
        }
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns Task
         */
        __init(i, bb) {
            this.bb_pos = i;
            this.bb = bb;
            return this;
        }
        ;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param Task= obj
         * @returns Task
         */
        static getRootAsTask(bb, obj) {
            return (obj || new Task).__init(bb.readInt32(bb.position()) + bb.position(), bb);
        }
        ;
        /**
         * @param number index
         * @param schema.Stage= obj
         * @returns schema.Stage
         */
        stages(index, obj) {
            var offset = this.bb.__offset(this.bb_pos, 4);
            return offset ? (obj || new schema.Stage).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
        }
        ;
        /**
         * @returns number
         */
        stagesLength() {
            var offset = this.bb.__offset(this.bb_pos, 4);
            return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
        }
        ;
        artifacts(index, optionalEncoding) {
            var offset = this.bb.__offset(this.bb_pos, 6);
            return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
        }
        ;
        /**
         * @returns number
         */
        artifactsLength() {
            var offset = this.bb.__offset(this.bb_pos, 6);
            return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         */
        static startTask(builder) {
            builder.startObject(2);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset stagesOffset
         */
        static addStages(builder, stagesOffset) {
            builder.addFieldOffset(0, stagesOffset, 0);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createStagesVector(builder, data) {
            builder.startVector(4, data.length, 4);
            for (var i = data.length - 1; i >= 0; i--) {
                builder.addOffset(data[i]);
            }
            return builder.endVector();
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startStagesVector(builder, numElems) {
            builder.startVector(4, numElems, 4);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset artifactsOffset
         */
        static addArtifacts(builder, artifactsOffset) {
            builder.addFieldOffset(1, artifactsOffset, 0);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createArtifactsVector(builder, data) {
            builder.startVector(4, data.length, 4);
            for (var i = data.length - 1; i >= 0; i--) {
                builder.addOffset(data[i]);
            }
            return builder.endVector();
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startArtifactsVector(builder, numElems) {
            builder.startVector(4, numElems, 4);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endTask(builder) {
            var offset = builder.endObject();
            return offset;
        }
        ;
        static createTask(builder, stagesOffset, artifactsOffset) {
            Task.startTask(builder);
            Task.addStages(builder, stagesOffset);
            Task.addArtifacts(builder, artifactsOffset);
            return Task.endTask(builder);
        }
    }
    schema.Task = Task;
})(schema = exports.schema || (exports.schema = {}));
/**
 * @constructor
 */
(function (schema) {
    class GetResult {
        constructor() {
            this.bb = null;
            this.bb_pos = 0;
        }
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns GetResult
         */
        __init(i, bb) {
            this.bb_pos = i;
            this.bb = bb;
            return this;
        }
        ;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param GetResult= obj
         * @returns GetResult
         */
        static getRootAsGetResult(bb, obj) {
            return (obj || new GetResult).__init(bb.readInt32(bb.position()) + bb.position(), bb);
        }
        ;
        idList(index, optionalEncoding) {
            var offset = this.bb.__offset(this.bb_pos, 4);
            return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
        }
        ;
        /**
         * @returns number
         */
        idListLength() {
            var offset = this.bb.__offset(this.bb_pos, 4);
            return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         */
        static startGetResult(builder) {
            builder.startObject(1);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset idListOffset
         */
        static addIdList(builder, idListOffset) {
            builder.addFieldOffset(0, idListOffset, 0);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createIdListVector(builder, data) {
            builder.startVector(4, data.length, 4);
            for (var i = data.length - 1; i >= 0; i--) {
                builder.addOffset(data[i]);
            }
            return builder.endVector();
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startIdListVector(builder, numElems) {
            builder.startVector(4, numElems, 4);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endGetResult(builder) {
            var offset = builder.endObject();
            return offset;
        }
        ;
        static createGetResult(builder, idListOffset) {
            GetResult.startGetResult(builder);
            GetResult.addIdList(builder, idListOffset);
            return GetResult.endGetResult(builder);
        }
    }
    schema.GetResult = GetResult;
})(schema = exports.schema || (exports.schema = {}));
/**
 * @constructor
 */
(function (schema) {
    class GetHardwarePool {
        constructor() {
            this.bb = null;
            this.bb_pos = 0;
        }
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns GetHardwarePool
         */
        __init(i, bb) {
            this.bb_pos = i;
            this.bb = bb;
            return this;
        }
        ;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param GetHardwarePool= obj
         * @returns GetHardwarePool
         */
        static getRootAsGetHardwarePool(bb, obj) {
            return (obj || new GetHardwarePool).__init(bb.readInt32(bb.position()) + bb.position(), bb);
        }
        ;
        hardware(index, optionalEncoding) {
            var offset = this.bb.__offset(this.bb_pos, 4);
            return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
        }
        ;
        /**
         * @returns number
         */
        hardwareLength() {
            var offset = this.bb.__offset(this.bb_pos, 4);
            return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         */
        static startGetHardwarePool(builder) {
            builder.startObject(1);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset hardwareOffset
         */
        static addHardware(builder, hardwareOffset) {
            builder.addFieldOffset(0, hardwareOffset, 0);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<flatbuffers.Offset> data
         * @returns flatbuffers.Offset
         */
        static createHardwareVector(builder, data) {
            builder.startVector(4, data.length, 4);
            for (var i = data.length - 1; i >= 0; i--) {
                builder.addOffset(data[i]);
            }
            return builder.endVector();
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startHardwareVector(builder, numElems) {
            builder.startVector(4, numElems, 4);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endGetHardwarePool(builder) {
            var offset = builder.endObject();
            return offset;
        }
        ;
        static createGetHardwarePool(builder, hardwareOffset) {
            GetHardwarePool.startGetHardwarePool(builder);
            GetHardwarePool.addHardware(builder, hardwareOffset);
            return GetHardwarePool.endGetHardwarePool(builder);
        }
    }
    schema.GetHardwarePool = GetHardwarePool;
})(schema = exports.schema || (exports.schema = {}));
/**
 * @constructor
 */
(function (schema) {
    class File {
        constructor() {
            this.bb = null;
            this.bb_pos = 0;
        }
        /**
         * @param number i
         * @param flatbuffers.ByteBuffer bb
         * @returns File
         */
        __init(i, bb) {
            this.bb_pos = i;
            this.bb = bb;
            return this;
        }
        ;
        /**
         * @param flatbuffers.ByteBuffer bb
         * @param File= obj
         * @returns File
         */
        static getRootAsFile(bb, obj) {
            return (obj || new File).__init(bb.readInt32(bb.position()) + bb.position(), bb);
        }
        ;
        filename(optionalEncoding) {
            var offset = this.bb.__offset(this.bb_pos, 4);
            return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
        }
        ;
        /**
         * @returns number
         */
        packetnumber() {
            var offset = this.bb.__offset(this.bb_pos, 6);
            return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
        }
        ;
        /**
         * @returns boolean
         */
        eof() {
            var offset = this.bb.__offset(this.bb_pos, 8);
            return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
        }
        ;
        /**
         * @param number index
         * @returns number
         */
        data(index) {
            var offset = this.bb.__offset(this.bb_pos, 10);
            return offset ? this.bb.readUint8(this.bb.__vector(this.bb_pos + offset) + index) : 0;
        }
        ;
        /**
         * @returns number
         */
        dataLength() {
            var offset = this.bb.__offset(this.bb_pos, 10);
            return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
        }
        ;
        /**
         * @returns Uint8Array
         */
        dataArray() {
            var offset = this.bb.__offset(this.bb_pos, 10);
            return offset ? new Uint8Array(this.bb.bytes().buffer, this.bb.bytes().byteOffset + this.bb.__vector(this.bb_pos + offset), this.bb.__vector_len(this.bb_pos + offset)) : null;
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         */
        static startFile(builder) {
            builder.startObject(4);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset filenameOffset
         */
        static addFilename(builder, filenameOffset) {
            builder.addFieldOffset(0, filenameOffset, 0);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param number packetnumber
         */
        static addPacketnumber(builder, packetnumber) {
            builder.addFieldInt32(1, packetnumber, 0);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param boolean eof
         */
        static addEof(builder, eof) {
            builder.addFieldInt8(2, +eof, +false);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param flatbuffers.Offset dataOffset
         */
        static addData(builder, dataOffset) {
            builder.addFieldOffset(3, dataOffset, 0);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param Array.<number> data
         * @returns flatbuffers.Offset
         */
        static createDataVector(builder, data) {
            builder.startVector(1, data.length, 1);
            for (var i = data.length - 1; i >= 0; i--) {
                builder.addInt8(data[i]);
            }
            return builder.endVector();
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @param number numElems
         */
        static startDataVector(builder, numElems) {
            builder.startVector(1, numElems, 1);
        }
        ;
        /**
         * @param flatbuffers.Builder builder
         * @returns flatbuffers.Offset
         */
        static endFile(builder) {
            var offset = builder.endObject();
            return offset;
        }
        ;
        static createFile(builder, filenameOffset, packetnumber, eof, dataOffset) {
            File.startFile(builder);
            File.addFilename(builder, filenameOffset);
            File.addPacketnumber(builder, packetnumber);
            File.addEof(builder, eof);
            File.addData(builder, dataOffset);
            return File.endFile(builder);
        }
    }
    schema.File = File;
})(schema = exports.schema || (exports.schema = {}));