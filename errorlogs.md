main.js:11 [Vue Router warn]: <router-view> can no longer be used directly inside <transition> or <keep-alive>.
Use slot props instead:

<router-view v-slot="{ Component }">
  <transition>
    <component :is="Component" />
  </transition>
</router-view>
warn$1 @ devtools-BLCumUwL.mjs:117
warnDeprecatedUsage @ vue-router.mjs:1172
setup @ vue-router.mjs:1091
callWithErrorHandling @ runtime-core.esm-bundler.js:351
setupStatefulComponent @ runtime-core.esm-bundler.js:8138
setupComponent @ runtime-core.esm-bundler.js:8099
mountComponent @ runtime-core.esm-bundler.js:5420
processComponent @ runtime-core.esm-bundler.js:5386
patch @ runtime-core.esm-bundler.js:4904
componentUpdateFn @ runtime-core.esm-bundler.js:5532
run @ reactivity.esm-bundler.js:291
setupRenderEffect @ runtime-core.esm-bundler.js:5660
mountComponent @ runtime-core.esm-bundler.js:5434
processComponent @ runtime-core.esm-bundler.js:5386
patch @ runtime-core.esm-bundler.js:4904
componentUpdateFn @ runtime-core.esm-bundler.js:5532
run @ reactivity.esm-bundler.js:291
setupRenderEffect @ runtime-core.esm-bundler.js:5660
mountComponent @ runtime-core.esm-bundler.js:5434
processComponent @ runtime-core.esm-bundler.js:5386
patch @ runtime-core.esm-bundler.js:4904
mountChildren @ runtime-core.esm-bundler.js:5148
mountElement @ runtime-core.esm-bundler.js:5071
processElement @ runtime-core.esm-bundler.js:5026
patch @ runtime-core.esm-bundler.js:4892
mountChildren @ runtime-core.esm-bundler.js:5148
mountElement @ runtime-core.esm-bundler.js:5071
processElement @ runtime-core.esm-bundler.js:5026
patch @ runtime-core.esm-bundler.js:4892
mountChildren @ runtime-core.esm-bundler.js:5148
mountElement @ runtime-core.esm-bundler.js:5071
processElement @ runtime-core.esm-bundler.js:5026
patch @ runtime-core.esm-bundler.js:4892
componentUpdateFn @ runtime-core.esm-bundler.js:5532
run @ reactivity.esm-bundler.js:291
setupRenderEffect @ runtime-core.esm-bundler.js:5660
mountComponent @ runtime-core.esm-bundler.js:5434
processComponent @ runtime-core.esm-bundler.js:5386
patch @ runtime-core.esm-bundler.js:4904
componentUpdateFn @ runtime-core.esm-bundler.js:5612
run @ reactivity.esm-bundler.js:291
runIfDirty @ reactivity.esm-bundler.js:329
callWithErrorHandling @ runtime-core.esm-bundler.js:351
flushJobs @ runtime-core.esm-bundler.js:557
Promise.then
queueFlush @ runtime-core.esm-bundler.js:471
queueJob @ runtime-core.esm-bundler.js:466
effect.scheduler @ runtime-core.esm-bundler.js:5654
trigger @ reactivity.esm-bundler.js:319
endBatch @ reactivity.esm-bundler.js:377
notify @ reactivity.esm-bundler.js:668
trigger @ reactivity.esm-bundler.js:642
set value @ reactivity.esm-bundler.js:1523
finalizeNavigation @ vue-router.mjs:1417
eval @ vue-router.mjs:1345
Promise.then
pushWithRedirect @ vue-router.mjs:1333
push @ vue-router.mjs:1286
install @ vue-router.mjs:1533
use @ runtime-core.esm-bundler.js:4072
eval @ main.js:11
./src/main.js @ app.js:473
__webpack_require__ @ app.js:1116
(anonymous) @ app.js:2249
(anonymous) @ app.js:1158
(anonymous) @ app.js:2250
(anonymous) @ app.js:2252
main.js:11 The Content Security Policy 'default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self';' was delivered via a <meta> element outside the document's <head>, which is disallowed. The policy has been ignored.
insert @ runtime-dom.esm-bundler.js:202
mountElement @ runtime-core.esm-bundler.js:5110
processElement @ runtime-core.esm-bundler.js:5026
patch @ runtime-core.esm-bundler.js:4892
componentUpdateFn @ runtime-core.esm-bundler.js:5532
run @ reactivity.esm-bundler.js:291
setupRenderEffect @ runtime-core.esm-bundler.js:5660
mountComponent @ runtime-core.esm-bundler.js:5434
processComponent @ runtime-core.esm-bundler.js:5386
patch @ runtime-core.esm-bundler.js:4904
componentUpdateFn @ runtime-core.esm-bundler.js:5612
run @ reactivity.esm-bundler.js:291
runIfDirty @ reactivity.esm-bundler.js:329
callWithErrorHandling @ runtime-core.esm-bundler.js:351
flushJobs @ runtime-core.esm-bundler.js:557
Promise.then
queueFlush @ runtime-core.esm-bundler.js:471
queueJob @ runtime-core.esm-bundler.js:466
effect.scheduler @ runtime-core.esm-bundler.js:5654
trigger @ reactivity.esm-bundler.js:319
endBatch @ reactivity.esm-bundler.js:377
notify @ reactivity.esm-bundler.js:668
trigger @ reactivity.esm-bundler.js:642
set value @ reactivity.esm-bundler.js:1523
finalizeNavigation @ vue-router.mjs:1417
eval @ vue-router.mjs:1345
Promise.then
pushWithRedirect @ vue-router.mjs:1333
push @ vue-router.mjs:1286
install @ vue-router.mjs:1533
use @ runtime-core.esm-bundler.js:4072
eval @ main.js:11
./src/main.js @ app.js:473
__webpack_require__ @ app.js:1116
(anonymous) @ app.js:2249
(anonymous) @ app.js:1158
(anonymous) @ app.js:2250
(anonymous) @ app.js:2252
main.js:11 The Content Security Policy 'default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self';' was delivered via a <meta> element outside the document's <head>, which is disallowed. The policy has been ignored.
insert @ runtime-dom.esm-bundler.js:202
mountElement @ runtime-core.esm-bundler.js:5110
processElement @ runtime-core.esm-bundler.js:5026
patch @ runtime-core.esm-bundler.js:4892
componentUpdateFn @ runtime-core.esm-bundler.js:5532
run @ reactivity.esm-bundler.js:291
setupRenderEffect @ runtime-core.esm-bundler.js:5660
mountComponent @ runtime-core.esm-bundler.js:5434
processComponent @ runtime-core.esm-bundler.js:5386
patch @ runtime-core.esm-bundler.js:4904
componentUpdateFn @ runtime-core.esm-bundler.js:5612
run @ reactivity.esm-bundler.js:291
runIfDirty @ reactivity.esm-bundler.js:329
callWithErrorHandling @ runtime-core.esm-bundler.js:351
flushJobs @ runtime-core.esm-bundler.js:557
Promise.then
queueFlush @ runtime-core.esm-bundler.js:471
queueJob @ runtime-core.esm-bundler.js:466
effect.scheduler @ runtime-core.esm-bundler.js:5654
trigger @ reactivity.esm-bundler.js:319
endBatch @ reactivity.esm-bundler.js:377
notify @ reactivity.esm-bundler.js:668
trigger @ reactivity.esm-bundler.js:642
set value @ reactivity.esm-bundler.js:1523
finalizeNavigation @ vue-router.mjs:1417
eval @ vue-router.mjs:1345
Promise.then
pushWithRedirect @ vue-router.mjs:1333
push @ vue-router.mjs:1286
install @ vue-router.mjs:1533
use @ runtime-core.esm-bundler.js:4072
eval @ main.js:11
./src/main.js @ app.js:473
__webpack_require__ @ app.js:1116
(anonymous) @ app.js:2249
(anonymous) @ app.js:1158
(anonymous) @ app.js:2250
(anonymous) @ app.js:2252
index.js??ruleSet[0].use[0]!./src/modules/attendance/SecureAttendanceModule.vue?vue&type=script&lang=js:65 🔍 Searching for employee: 00049
index.js??ruleSet[0].use[0]!./src/modules/attendance/SecureAttendanceModule.vue?vue&type=script&lang=js:85 ❌ Employee search failed: TypeError: _services_api__WEBPACK_IMPORTED_MODULE_5__.default.post is not a function
    at Proxy.searchEmployee (index.js??ruleSet[0].use[0]!./src/modules/attendance/SecureAttendanceModule.vue?vue&type=script&lang=js:67:86)
    at onClick._cache.<computed>._cache.<computed> (templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/modules/attendance/SecureAttendanceModule.vue?vue&type=template&id=b1bf957e&scoped=true:200:102)
    at callWithErrorHandling (runtime-core.esm-bundler.js:351:19)
    at callWithAsyncErrorHandling (runtime-core.esm-bundler.js:358:17)
    at HTMLButtonElement.invoker (runtime-dom.esm-bundler.js:904:82)
searchEmployee @ index.js??ruleSet[0].use[0]!./src/modules/attendance/SecureAttendanceModule.vue?vue&type=script&lang=js:85
onClick._cache.<computed>._cache.<computed> @ templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/modules/attendance/SecureAttendanceModule.vue?vue&type=template&id=b1bf957e&scoped=true:200
callWithErrorHandling @ runtime-core.esm-bundler.js:351
callWithAsyncErrorHandling @ runtime-core.esm-bundler.js:358
invoker @ runtime-dom.esm-bundler.js:904
index.js??ruleSet[0].use[0]!./src/modules/attendance/SecureAttendanceModule.vue?vue&type=script&lang=js:65 🔍 Searching for employee: 00049
index.js??ruleSet[0].use[0]!./src/modules/attendance/SecureAttendanceModule.vue?vue&type=script&lang=js:85 ❌ Employee search failed: TypeError: _services_api__WEBPACK_IMPORTED_MODULE_5__.default.post is not a function
    at Proxy.searchEmployee (index.js??ruleSet[0].use[0]!./src/modules/attendance/SecureAttendanceModule.vue?vue&type=script&lang=js:67:86)
    at onClick._cache.<computed>._cache.<computed> (templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/modules/attendance/SecureAttendanceModule.vue?vue&type=template&id=b1bf957e&scoped=true:200:102)
    at callWithErrorHandling (runtime-core.esm-bundler.js:351:19)
    at callWithAsyncErrorHandling (runtime-core.esm-bundler.js:358:17)
    at HTMLButtonElement.invoker (runtime-dom.esm-bundler.js:904:82)
searchEmployee @ index.js??ruleSet[0].use[0]!./src/modules/attendance/SecureAttendanceModule.vue?vue&type=script&lang=js:85
onClick._cache.<computed>._cache.<computed> @ templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/modules/attendance/SecureAttendanceModule.vue?vue&type=template&id=b1bf957e&scoped=true:200
callWithErrorHandling @ runtime-core.esm-bundler.js:351
callWithAsyncErrorHandling @ runtime-core.esm-bundler.js:358
invoker @ runtime-dom.esm-bundler.js:904
