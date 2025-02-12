<!-- eslint-disable max-len -->
/*********************************************************************************************************************
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.                                                *
 *                                                                                                                    *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance    *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://www.apache.org/licenses/                                                                               *
 *                                                                                                                    *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/
<template lang="pug">
span(class="wrapper")
  v-dialog(
    v-model="loading"
    persistent
    max-width="60%"
  )
    v-card(id="edit-loading" title="Updating")
      v-card-text.my-3
        v-list-subheader.text-error(
          v-if="error"
          id="edit-error"
        ) {{ error }}
        v-list-subheader.text-success(
          v-if="success"
          id="edit-success"
        ) {{ success }}
        v-progress-linear(
          v-if="!error && !success"
          indeterminate
        )
      v-card-actions
        v-spacer
        v-btn(
          v-if="error"
          id="edit-close"
          flat
          @click="cancel"
        ) close
        v-btn(
          v-if="success"
          id="edit-close"
          flat
          @click="close"
        ) close
  v-dialog(
    v-model="dialog"
    max-width="80%"
  )
    template(v-slot:activator="{ props }")
      v-btn(
        v-if="!label"
        v-bind="props"
        variant="text"
        icon="edit"
        @click="refresh"
      )
      v-btn(
        v-if="label"
        v-bind="props"
        @click="refresh"
      ) {{ label }}
    v-card(id="edit-form")
      v-card-title(primary-title)
        .text-h5 Update: {{ data.qid }}
      v-card-text
        v-form
          schema-input(
            v-if="dialog"
            v-model="tmp"
            v-model:valid="valid"
            :schema="schema"
            :pick="required"
            :path="type"
          )
          v-expansion-panels
            v-expansion-panel.mt-3(elevation="0" style="display:block")
              v-expansion-panel-title Advanced
              v-expansion-panel-text
                schema-input(
                  v-model="tmp"
                  v-model:valid="valid"
                  :schema="schema"
                  :omit="required"
                  :path="type"
                )
        small * indicates required field
        v-list-subheader.text-error(v-if="error") {{ error }}
      v-card-actions
        v-spacer
        v-btn(
          id="edit-cancel"
          @click="cancel"
        ) Cancel
        v-btn(
          id="edit-submit"
          :disabled="!valid"
          @click="update"
        ) Update
</template>

<script>

require('vuex');
const _ = require('lodash');
const empty = require('./empty');

module.exports = {
    props: ['data', 'label'],
    data() {
        return {
            error: '',
            success: '',
            dialog: false,
            loading: false,
            opened: false,
            valid: true,
            tmp: {},
        };
    },
    components: {
        'schema-input': require('./input.vue').default,
    },
    computed: {
        type() {
            return this.data.type || 'qna';
        },
        schema() {
            return _.get(this, `$store.state.data.schema[${this.type}]`, { type: 'object' });
        },
        required() {
            return _.get(this, 'schema.required', []);
        },
    },
    methods: {
        cancel() {
            this.dialog = false;
            this.loading = false;
        },
        close() {
            this.cancel();
            this.$emit('filter');
        },
        refresh() {
            if (!this.opened) {
                this.tmp = _.merge(empty(this.schema), _.cloneDeep(this.data));
                this.opened = true;
            }
        },
        async update() {
            const self = this;
            if (this.valid) {
                self.loading = true;
                self.dialog = false;
                self.error = '';
                try {
                    if (self.data.qid !== self.tmp.qid) {
                        const exists = await self.$store.dispatch('api/check', self.tmp.qid);
                        if (exists) {
                          throw new Error('Question with that ID already Exists');
                        } else {
                          await self.$store.dispatch('api/remove', self.data.qid);
                        }
                    }
                    const newdata = clean(_.cloneDeep(self.tmp));
                    delete newdata.quniqueterms;
                    await self.$store.dispatch('data/update', newdata);
                    self.$emit('update:data', _.cloneDeep(newdata));
                    self.success = 'Success!';
                } catch (error) {
                    self.dialog = true;
                    self.loading = false;
                    console.log(error);
                    self.error = error;
                }
            }
        },
    },
};

function clean(obj) {
    let out;
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            obj[i] = clean(obj[i]);
        }
        out = _.compact(obj);
        return out.length ? out : null;
    }

    if (typeof obj === 'object') {
        for (const key in obj) {
            obj[key] = clean(obj[key]);
        }
        out = _.pickBy(obj);
        return _.keys(out).length ? out : null;
    }

    if (typeof obj === 'boolean') {
        return obj;
    }

    if (obj.trim) {
        return obj.trim() || null;
    }

    return obj;
}

</script>

<style lang='scss' scoped>
  .wrapper {
    display:inline-block;
  }
  li {
    display:flex;
  }
</style>
