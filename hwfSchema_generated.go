// Code generated by the FlatBuffers compiler. DO NOT EDIT.

package 

import (
	"strconv"

	flatbuffers "github.com/google/flatbuffers/go"
)

type MessageBody byte

const (
	MessageBodyNONE            MessageBody = 0
	MessageBodyTask            MessageBody = 1
	MessageBodyGetResult       MessageBody = 2
	MessageBodyGetHardwarePool MessageBody = 3
	MessageBodyFile            MessageBody = 4
)

var EnumNamesMessageBody = map[MessageBody]string{
	MessageBodyNONE:            "NONE",
	MessageBodyTask:            "Task",
	MessageBodyGetResult:       "GetResult",
	MessageBodyGetHardwarePool: "GetHardwarePool",
	MessageBodyFile:            "File",
}

var EnumValuesMessageBody = map[string]MessageBody{
	"NONE":            MessageBodyNONE,
	"Task":            MessageBodyTask,
	"GetResult":       MessageBodyGetResult,
	"GetHardwarePool": MessageBodyGetHardwarePool,
	"File":            MessageBodyFile,
}

func (v MessageBody) String() string {
	if s, ok := EnumNamesMessageBody[v]; ok {
		return s
	}
	return "MessageBody(" + strconv.FormatInt(int64(v), 10) + ")"
}

type Message struct {
	_tab flatbuffers.Table
}

func GetRootAsMessage(buf []byte, offset flatbuffers.UOffsetT) *Message {
	n := flatbuffers.GetUOffsetT(buf[offset:])
	x := &Message{}
	x.Init(buf, n+offset)
	return x
}

func GetSizePrefixedRootAsMessage(buf []byte, offset flatbuffers.UOffsetT) *Message {
	n := flatbuffers.GetUOffsetT(buf[offset+flatbuffers.SizeUint32:])
	x := &Message{}
	x.Init(buf, n+offset+flatbuffers.SizeUint32)
	return x
}

func (rcv *Message) Init(buf []byte, i flatbuffers.UOffsetT) {
	rcv._tab.Bytes = buf
	rcv._tab.Pos = i
}

func (rcv *Message) Table() flatbuffers.Table {
	return rcv._tab
}

func (rcv *Message) Type() int32 {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(4))
	if o != 0 {
		return rcv._tab.GetInt32(o + rcv._tab.Pos)
	}
	return 0
}

func (rcv *Message) MutateType(n int32) bool {
	return rcv._tab.MutateInt32Slot(4, n)
}

func (rcv *Message) BodyType() MessageBody {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(6))
	if o != 0 {
		return MessageBody(rcv._tab.GetByte(o + rcv._tab.Pos))
	}
	return 0
}

func (rcv *Message) MutateBodyType(n MessageBody) bool {
	return rcv._tab.MutateByteSlot(6, byte(n))
}

func (rcv *Message) Body(obj *flatbuffers.Table) bool {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(8))
	if o != 0 {
		rcv._tab.Union(obj, o)
		return true
	}
	return false
}

func MessageStart(builder *flatbuffers.Builder) {
	builder.StartObject(3)
}
func MessageAddType(builder *flatbuffers.Builder, type_ int32) {
	builder.PrependInt32Slot(0, type_, 0)
}
func MessageAddBodyType(builder *flatbuffers.Builder, bodyType MessageBody) {
	builder.PrependByteSlot(1, byte(bodyType), 0)
}
func MessageAddBody(builder *flatbuffers.Builder, body flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(2, flatbuffers.UOffsetT(body), 0)
}
func MessageEnd(builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	return builder.EndObject()
}
type Stage struct {
	_tab flatbuffers.Table
}

func GetRootAsStage(buf []byte, offset flatbuffers.UOffsetT) *Stage {
	n := flatbuffers.GetUOffsetT(buf[offset:])
	x := &Stage{}
	x.Init(buf, n+offset)
	return x
}

func GetSizePrefixedRootAsStage(buf []byte, offset flatbuffers.UOffsetT) *Stage {
	n := flatbuffers.GetUOffsetT(buf[offset+flatbuffers.SizeUint32:])
	x := &Stage{}
	x.Init(buf, n+offset+flatbuffers.SizeUint32)
	return x
}

func (rcv *Stage) Init(buf []byte, i flatbuffers.UOffsetT) {
	rcv._tab.Bytes = buf
	rcv._tab.Pos = i
}

func (rcv *Stage) Table() flatbuffers.Table {
	return rcv._tab
}

func (rcv *Stage) Name() []byte {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(4))
	if o != 0 {
		return rcv._tab.ByteVector(o + rcv._tab.Pos)
	}
	return nil
}

func (rcv *Stage) Data(j int) int8 {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(6))
	if o != 0 {
		a := rcv._tab.Vector(o)
		return rcv._tab.GetInt8(a + flatbuffers.UOffsetT(j*1))
	}
	return 0
}

func (rcv *Stage) DataLength() int {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(6))
	if o != 0 {
		return rcv._tab.VectorLen(o)
	}
	return 0
}

func (rcv *Stage) MutateData(j int, n int8) bool {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(6))
	if o != 0 {
		a := rcv._tab.Vector(o)
		return rcv._tab.MutateInt8(a+flatbuffers.UOffsetT(j*1), n)
	}
	return false
}

func (rcv *Stage) CmdList(j int) []byte {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(8))
	if o != 0 {
		a := rcv._tab.Vector(o)
		return rcv._tab.ByteVector(a + flatbuffers.UOffsetT(j*4))
	}
	return nil
}

func (rcv *Stage) CmdListLength() int {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(8))
	if o != 0 {
		return rcv._tab.VectorLen(o)
	}
	return 0
}

func (rcv *Stage) TrackTime() bool {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(10))
	if o != 0 {
		return rcv._tab.GetBool(o + rcv._tab.Pos)
	}
	return true
}

func (rcv *Stage) MutateTrackTime(n bool) bool {
	return rcv._tab.MutateBoolSlot(10, n)
}

func (rcv *Stage) TrackRam() bool {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(12))
	if o != 0 {
		return rcv._tab.GetBool(o + rcv._tab.Pos)
	}
	return false
}

func (rcv *Stage) MutateTrackRam(n bool) bool {
	return rcv._tab.MutateBoolSlot(12, n)
}

func (rcv *Stage) TrackCpu() bool {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(14))
	if o != 0 {
		return rcv._tab.GetBool(o + rcv._tab.Pos)
	}
	return false
}

func (rcv *Stage) MutateTrackCpu(n bool) bool {
	return rcv._tab.MutateBoolSlot(14, n)
}

func (rcv *Stage) TrackGpu() bool {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(16))
	if o != 0 {
		return rcv._tab.GetBool(o + rcv._tab.Pos)
	}
	return false
}

func (rcv *Stage) MutateTrackGpu(n bool) bool {
	return rcv._tab.MutateBoolSlot(16, n)
}

func (rcv *Stage) Comment() []byte {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(18))
	if o != 0 {
		return rcv._tab.ByteVector(o + rcv._tab.Pos)
	}
	return nil
}

func StageStart(builder *flatbuffers.Builder) {
	builder.StartObject(8)
}
func StageAddName(builder *flatbuffers.Builder, name flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(0, flatbuffers.UOffsetT(name), 0)
}
func StageAddData(builder *flatbuffers.Builder, data flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(1, flatbuffers.UOffsetT(data), 0)
}
func StageStartDataVector(builder *flatbuffers.Builder, numElems int) flatbuffers.UOffsetT {
	return builder.StartVector(1, numElems, 1)
}
func StageAddCmdList(builder *flatbuffers.Builder, cmdList flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(2, flatbuffers.UOffsetT(cmdList), 0)
}
func StageStartCmdListVector(builder *flatbuffers.Builder, numElems int) flatbuffers.UOffsetT {
	return builder.StartVector(4, numElems, 4)
}
func StageAddTrackTime(builder *flatbuffers.Builder, trackTime bool) {
	builder.PrependBoolSlot(3, trackTime, true)
}
func StageAddTrackRam(builder *flatbuffers.Builder, trackRam bool) {
	builder.PrependBoolSlot(4, trackRam, false)
}
func StageAddTrackCpu(builder *flatbuffers.Builder, trackCpu bool) {
	builder.PrependBoolSlot(5, trackCpu, false)
}
func StageAddTrackGpu(builder *flatbuffers.Builder, trackGpu bool) {
	builder.PrependBoolSlot(6, trackGpu, false)
}
func StageAddComment(builder *flatbuffers.Builder, comment flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(7, flatbuffers.UOffsetT(comment), 0)
}
func StageEnd(builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	return builder.EndObject()
}
type Task struct {
	_tab flatbuffers.Table
}

func GetRootAsTask(buf []byte, offset flatbuffers.UOffsetT) *Task {
	n := flatbuffers.GetUOffsetT(buf[offset:])
	x := &Task{}
	x.Init(buf, n+offset)
	return x
}

func GetSizePrefixedRootAsTask(buf []byte, offset flatbuffers.UOffsetT) *Task {
	n := flatbuffers.GetUOffsetT(buf[offset+flatbuffers.SizeUint32:])
	x := &Task{}
	x.Init(buf, n+offset+flatbuffers.SizeUint32)
	return x
}

func (rcv *Task) Init(buf []byte, i flatbuffers.UOffsetT) {
	rcv._tab.Bytes = buf
	rcv._tab.Pos = i
}

func (rcv *Task) Table() flatbuffers.Table {
	return rcv._tab
}

func (rcv *Task) Hardware(obj *Hardware) *Hardware {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(4))
	if o != 0 {
		x := rcv._tab.Indirect(o + rcv._tab.Pos)
		if obj == nil {
			obj = new(Hardware)
		}
		obj.Init(rcv._tab.Bytes, x)
		return obj
	}
	return nil
}

func (rcv *Task) Stages(obj *Stage, j int) bool {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(6))
	if o != 0 {
		x := rcv._tab.Vector(o)
		x += flatbuffers.UOffsetT(j) * 4
		x = rcv._tab.Indirect(x)
		obj.Init(rcv._tab.Bytes, x)
		return true
	}
	return false
}

func (rcv *Task) StagesLength() int {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(6))
	if o != 0 {
		return rcv._tab.VectorLen(o)
	}
	return 0
}

func (rcv *Task) Artifacts(j int) []byte {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(8))
	if o != 0 {
		a := rcv._tab.Vector(o)
		return rcv._tab.ByteVector(a + flatbuffers.UOffsetT(j*4))
	}
	return nil
}

func (rcv *Task) ArtifactsLength() int {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(8))
	if o != 0 {
		return rcv._tab.VectorLen(o)
	}
	return 0
}

func TaskStart(builder *flatbuffers.Builder) {
	builder.StartObject(3)
}
func TaskAddHardware(builder *flatbuffers.Builder, hardware flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(0, flatbuffers.UOffsetT(hardware), 0)
}
func TaskAddStages(builder *flatbuffers.Builder, stages flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(1, flatbuffers.UOffsetT(stages), 0)
}
func TaskStartStagesVector(builder *flatbuffers.Builder, numElems int) flatbuffers.UOffsetT {
	return builder.StartVector(4, numElems, 4)
}
func TaskAddArtifacts(builder *flatbuffers.Builder, artifacts flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(2, flatbuffers.UOffsetT(artifacts), 0)
}
func TaskStartArtifactsVector(builder *flatbuffers.Builder, numElems int) flatbuffers.UOffsetT {
	return builder.StartVector(4, numElems, 4)
}
func TaskEnd(builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	return builder.EndObject()
}
type GetResult struct {
	_tab flatbuffers.Table
}

func GetRootAsGetResult(buf []byte, offset flatbuffers.UOffsetT) *GetResult {
	n := flatbuffers.GetUOffsetT(buf[offset:])
	x := &GetResult{}
	x.Init(buf, n+offset)
	return x
}

func GetSizePrefixedRootAsGetResult(buf []byte, offset flatbuffers.UOffsetT) *GetResult {
	n := flatbuffers.GetUOffsetT(buf[offset+flatbuffers.SizeUint32:])
	x := &GetResult{}
	x.Init(buf, n+offset+flatbuffers.SizeUint32)
	return x
}

func (rcv *GetResult) Init(buf []byte, i flatbuffers.UOffsetT) {
	rcv._tab.Bytes = buf
	rcv._tab.Pos = i
}

func (rcv *GetResult) Table() flatbuffers.Table {
	return rcv._tab
}

func (rcv *GetResult) IdList(j int) []byte {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(4))
	if o != 0 {
		a := rcv._tab.Vector(o)
		return rcv._tab.ByteVector(a + flatbuffers.UOffsetT(j*4))
	}
	return nil
}

func (rcv *GetResult) IdListLength() int {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(4))
	if o != 0 {
		return rcv._tab.VectorLen(o)
	}
	return 0
}

func GetResultStart(builder *flatbuffers.Builder) {
	builder.StartObject(1)
}
func GetResultAddIdList(builder *flatbuffers.Builder, idList flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(0, flatbuffers.UOffsetT(idList), 0)
}
func GetResultStartIdListVector(builder *flatbuffers.Builder, numElems int) flatbuffers.UOffsetT {
	return builder.StartVector(4, numElems, 4)
}
func GetResultEnd(builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	return builder.EndObject()
}
type GetHardwarePool struct {
	_tab flatbuffers.Table
}

func GetRootAsGetHardwarePool(buf []byte, offset flatbuffers.UOffsetT) *GetHardwarePool {
	n := flatbuffers.GetUOffsetT(buf[offset:])
	x := &GetHardwarePool{}
	x.Init(buf, n+offset)
	return x
}

func GetSizePrefixedRootAsGetHardwarePool(buf []byte, offset flatbuffers.UOffsetT) *GetHardwarePool {
	n := flatbuffers.GetUOffsetT(buf[offset+flatbuffers.SizeUint32:])
	x := &GetHardwarePool{}
	x.Init(buf, n+offset+flatbuffers.SizeUint32)
	return x
}

func (rcv *GetHardwarePool) Init(buf []byte, i flatbuffers.UOffsetT) {
	rcv._tab.Bytes = buf
	rcv._tab.Pos = i
}

func (rcv *GetHardwarePool) Table() flatbuffers.Table {
	return rcv._tab
}

func (rcv *GetHardwarePool) Hardware(j int) []byte {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(4))
	if o != 0 {
		a := rcv._tab.Vector(o)
		return rcv._tab.ByteVector(a + flatbuffers.UOffsetT(j*4))
	}
	return nil
}

func (rcv *GetHardwarePool) HardwareLength() int {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(4))
	if o != 0 {
		return rcv._tab.VectorLen(o)
	}
	return 0
}

func GetHardwarePoolStart(builder *flatbuffers.Builder) {
	builder.StartObject(1)
}
func GetHardwarePoolAddHardware(builder *flatbuffers.Builder, hardware flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(0, flatbuffers.UOffsetT(hardware), 0)
}
func GetHardwarePoolStartHardwareVector(builder *flatbuffers.Builder, numElems int) flatbuffers.UOffsetT {
	return builder.StartVector(4, numElems, 4)
}
func GetHardwarePoolEnd(builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	return builder.EndObject()
}
type File struct {
	_tab flatbuffers.Table
}

func GetRootAsFile(buf []byte, offset flatbuffers.UOffsetT) *File {
	n := flatbuffers.GetUOffsetT(buf[offset:])
	x := &File{}
	x.Init(buf, n+offset)
	return x
}

func GetSizePrefixedRootAsFile(buf []byte, offset flatbuffers.UOffsetT) *File {
	n := flatbuffers.GetUOffsetT(buf[offset+flatbuffers.SizeUint32:])
	x := &File{}
	x.Init(buf, n+offset+flatbuffers.SizeUint32)
	return x
}

func (rcv *File) Init(buf []byte, i flatbuffers.UOffsetT) {
	rcv._tab.Bytes = buf
	rcv._tab.Pos = i
}

func (rcv *File) Table() flatbuffers.Table {
	return rcv._tab
}

func (rcv *File) Filename() []byte {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(4))
	if o != 0 {
		return rcv._tab.ByteVector(o + rcv._tab.Pos)
	}
	return nil
}

func (rcv *File) Packetnumber() int32 {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(6))
	if o != 0 {
		return rcv._tab.GetInt32(o + rcv._tab.Pos)
	}
	return 0
}

func (rcv *File) MutatePacketnumber(n int32) bool {
	return rcv._tab.MutateInt32Slot(6, n)
}

func (rcv *File) Eof() bool {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(8))
	if o != 0 {
		return rcv._tab.GetBool(o + rcv._tab.Pos)
	}
	return false
}

func (rcv *File) MutateEof(n bool) bool {
	return rcv._tab.MutateBoolSlot(8, n)
}

func (rcv *File) Data(j int) byte {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(10))
	if o != 0 {
		a := rcv._tab.Vector(o)
		return rcv._tab.GetByte(a + flatbuffers.UOffsetT(j*1))
	}
	return 0
}

func (rcv *File) DataLength() int {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(10))
	if o != 0 {
		return rcv._tab.VectorLen(o)
	}
	return 0
}

func (rcv *File) DataBytes() []byte {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(10))
	if o != 0 {
		return rcv._tab.ByteVector(o + rcv._tab.Pos)
	}
	return nil
}

func (rcv *File) MutateData(j int, n byte) bool {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(10))
	if o != 0 {
		a := rcv._tab.Vector(o)
		return rcv._tab.MutateByte(a+flatbuffers.UOffsetT(j*1), n)
	}
	return false
}

func FileStart(builder *flatbuffers.Builder) {
	builder.StartObject(4)
}
func FileAddFilename(builder *flatbuffers.Builder, filename flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(0, flatbuffers.UOffsetT(filename), 0)
}
func FileAddPacketnumber(builder *flatbuffers.Builder, packetnumber int32) {
	builder.PrependInt32Slot(1, packetnumber, 0)
}
func FileAddEof(builder *flatbuffers.Builder, eof bool) {
	builder.PrependBoolSlot(2, eof, false)
}
func FileAddData(builder *flatbuffers.Builder, data flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(3, flatbuffers.UOffsetT(data), 0)
}
func FileStartDataVector(builder *flatbuffers.Builder, numElems int) flatbuffers.UOffsetT {
	return builder.StartVector(1, numElems, 1)
}
func FileEnd(builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	return builder.EndObject()
}
type Hardware struct {
	_tab flatbuffers.Table
}

func GetRootAsHardware(buf []byte, offset flatbuffers.UOffsetT) *Hardware {
	n := flatbuffers.GetUOffsetT(buf[offset:])
	x := &Hardware{}
	x.Init(buf, n+offset)
	return x
}

func GetSizePrefixedRootAsHardware(buf []byte, offset flatbuffers.UOffsetT) *Hardware {
	n := flatbuffers.GetUOffsetT(buf[offset+flatbuffers.SizeUint32:])
	x := &Hardware{}
	x.Init(buf, n+offset+flatbuffers.SizeUint32)
	return x
}

func (rcv *Hardware) Init(buf []byte, i flatbuffers.UOffsetT) {
	rcv._tab.Bytes = buf
	rcv._tab.Pos = i
}

func (rcv *Hardware) Table() flatbuffers.Table {
	return rcv._tab
}

func (rcv *Hardware) Cpu() []byte {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(4))
	if o != 0 {
		return rcv._tab.ByteVector(o + rcv._tab.Pos)
	}
	return nil
}

func (rcv *Hardware) Gpu() []byte {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(6))
	if o != 0 {
		return rcv._tab.ByteVector(o + rcv._tab.Pos)
	}
	return nil
}

func (rcv *Hardware) Os() []byte {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(8))
	if o != 0 {
		return rcv._tab.ByteVector(o + rcv._tab.Pos)
	}
	return nil
}

func (rcv *Hardware) Ram() []byte {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(10))
	if o != 0 {
		return rcv._tab.ByteVector(o + rcv._tab.Pos)
	}
	return nil
}

func HardwareStart(builder *flatbuffers.Builder) {
	builder.StartObject(4)
}
func HardwareAddCpu(builder *flatbuffers.Builder, cpu flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(0, flatbuffers.UOffsetT(cpu), 0)
}
func HardwareAddGpu(builder *flatbuffers.Builder, gpu flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(1, flatbuffers.UOffsetT(gpu), 0)
}
func HardwareAddOs(builder *flatbuffers.Builder, os flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(2, flatbuffers.UOffsetT(os), 0)
}
func HardwareAddRam(builder *flatbuffers.Builder, ram flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(3, flatbuffers.UOffsetT(ram), 0)
}
func HardwareEnd(builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	return builder.EndObject()
}