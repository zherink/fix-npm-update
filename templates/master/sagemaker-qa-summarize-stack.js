module.exports={
    "SageMakerQASummarizeStack":{
        "Type" : "AWS::CloudFormation::Stack",
        "Condition":"QASummarizeSagemaker",
        "Properties" : {
            "TemplateURL" :{"Fn::Sub":"https://${BootstrapBucket}.s3.${AWS::Region}.amazonaws.com/${BootstrapPrefix}/templates/sagemaker-qa-summarize-stack.json"},
            "Parameters" :{
                "CFNLambda":{"Fn::GetAtt":["CFNLambda","Arn"]},
                "BootstrapBucket":{"Ref":"BootstrapBucket"},
                "BootstrapPrefix":{"Ref":"BootstrapPrefix"},
                "SagemakerInitialInstanceCount":{"Ref":"SagemakerQASummarizeInitialInstanceCount"},
                "VPCSubnetIdList":{"Fn::Join":[",",{"Ref":"VPCSubnetIdList"}]},
                "VPCSecurityGroupIdList":{"Fn::Join":[",",{"Ref":"VPCSecurityGroupIdList"}]},
            }
        }
    }
}