from runtime.preference_hierarchy import compile_scopes
from runtime.preference_evaluation import evaluate


def director(fn='setup'):
    return {'segments':[{'id':'s1','start':0,'end':2,'narrative_function':fn,'attention_target':'x'}]}


def test_project_brand_user_hierarchy_is_bounded_and_non_semantic():
    records=[
      {'project_id':'p1','brand_id':'b1','user_id':'u1','action':'prefer','preferred_profile':'editorial_restraint','weight':3},
      {'project_id':'p1','brand_id':'b1','user_id':'u1','action':'prefer','preferred_profile':'editorial_restraint','weight':3},
      {'project_id':'other','brand_id':'b1','user_id':'u1','action':'prefer','preferred_profile':'precision_tech','weight':1},
      {'project_id':'other','brand_id':'other','user_id':'u1','action':'reject','preferred_profile':'kinetic_signal','weight':1},
    ]
    evidence=compile_scopes(records,project_id='p1',brand_id='b1',user_id='u1')
    assert evidence['semantic_mutation_allowed'] is False
    assert evidence['profile_bias']['editorial_restraint'] > evidence['profile_bias']['precision_tech']
    assert max(abs(v) for v in evidence['profile_bias'].values()) <= 1.5
    assert evidence['precedence'][0] == 'explicit_user_or_brand_constraint'


def test_held_out_evaluation_detects_preference_lift():
    evidence={'confidence':.9,'profile_bias':{'editorial_restraint':1.5,'precision_tech':-1.5,'kinetic_signal':0}}
    held_out=[
      {'context':{'content_type':'product'},'director_ir':director('setup'),'expected_profile':'editorial_restraint'},
      {'context':{'content_type':'business'},'director_ir':director('setup'),'expected_profile':'editorial_restraint'},
    ]
    report=evaluate(held_out,evidence=evidence)
    assert report['sample_count']==2
    assert report['after_accuracy'] >= report['before_accuracy']
    assert report['lift'] > 0
    assert report['improved'] is True
