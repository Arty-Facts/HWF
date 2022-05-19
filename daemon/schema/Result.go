// Code generated by the FlatBuffers compiler. DO NOT EDIT.

package schema

import (
	flatbuffers "github.com/google/flatbuffers/go"
)

type Result struct {
	_tab flatbuffers.Table
}

func GetRootAsResult(buf []byte, offset flatbuffers.UOffsetT) *Result {
	n := flatbuffers.GetUOffsetT(buf[offset:])
	x := &Result{}
	x.Init(buf, n+offset)
	return x
}

func GetSizePrefixedRootAsResult(buf []byte, offset flatbuffers.UOffsetT) *Result {
	n := flatbuffers.GetUOffsetT(buf[offset+flatbuffers.SizeUint32:])
	x := &Result{}
	x.Init(buf, n+offset+flatbuffers.SizeUint32)
	return x
}

func (rcv *Result) Init(buf []byte, i flatbuffers.UOffsetT) {
	rcv._tab.Bytes = buf
	rcv._tab.Pos = i
}

func (rcv *Result) Table() flatbuffers.Table {
	return rcv._tab
}

func (rcv *Result) Time() int32 {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(4))
	if o != 0 {
		return rcv._tab.GetInt32(o + rcv._tab.Pos)
	}
	return 0
}

func (rcv *Result) MutateTime(n int32) bool {
	return rcv._tab.MutateInt32Slot(4, n)
}

func (rcv *Result) Stages(obj *StageResult, j int) bool {
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

func (rcv *Result) StagesLength() int {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(6))
	if o != 0 {
		return rcv._tab.VectorLen(o)
	}
	return 0
}

func (rcv *Result) Artifacts(obj *Artifact, j int) bool {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(8))
	if o != 0 {
		x := rcv._tab.Vector(o)
		x += flatbuffers.UOffsetT(j) * 4
		x = rcv._tab.Indirect(x)
		obj.Init(rcv._tab.Bytes, x)
		return true
	}
	return false
}

func (rcv *Result) ArtifactsLength() int {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(8))
	if o != 0 {
		return rcv._tab.VectorLen(o)
	}
	return 0
}

func (rcv *Result) Hardware(obj *Hardware, j int) bool {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(10))
	if o != 0 {
		x := rcv._tab.Vector(o)
		x += flatbuffers.UOffsetT(j) * 4
		x = rcv._tab.Indirect(x)
		obj.Init(rcv._tab.Bytes, x)
		return true
	}
	return false
}

func (rcv *Result) HardwareLength() int {
	o := flatbuffers.UOffsetT(rcv._tab.Offset(10))
	if o != 0 {
		return rcv._tab.VectorLen(o)
	}
	return 0
}

func ResultStart(builder *flatbuffers.Builder) {
	builder.StartObject(4)
}
func ResultAddTime(builder *flatbuffers.Builder, time int32) {
	builder.PrependInt32Slot(0, time, 0)
}
func ResultAddStages(builder *flatbuffers.Builder, stages flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(1, flatbuffers.UOffsetT(stages), 0)
}
func ResultStartStagesVector(builder *flatbuffers.Builder, numElems int) flatbuffers.UOffsetT {
	return builder.StartVector(4, numElems, 4)
}
func ResultAddArtifacts(builder *flatbuffers.Builder, artifacts flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(2, flatbuffers.UOffsetT(artifacts), 0)
}
func ResultStartArtifactsVector(builder *flatbuffers.Builder, numElems int) flatbuffers.UOffsetT {
	return builder.StartVector(4, numElems, 4)
}
func ResultAddHardware(builder *flatbuffers.Builder, hardware flatbuffers.UOffsetT) {
	builder.PrependUOffsetTSlot(3, flatbuffers.UOffsetT(hardware), 0)
}
func ResultStartHardwareVector(builder *flatbuffers.Builder, numElems int) flatbuffers.UOffsetT {
	return builder.StartVector(4, numElems, 4)
}
func ResultEnd(builder *flatbuffers.Builder) flatbuffers.UOffsetT {
	return builder.EndObject()
}
